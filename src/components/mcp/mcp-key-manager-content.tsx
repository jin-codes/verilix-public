'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Check, X, Plus, KeyRound, Trash2, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateApiKey, sha256Hex } from '@/lib/mcp-key'
import { copyToClipboard } from '@/lib/utils'

type CopyStatus = 'idle' | 'copied' | 'error'

interface ApiKeyRow {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

interface OAuthTokenRow {
  id: string
  client_id: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
  mcp_oauth_clients: { client_name: string | null } | null
}

interface ConnectedApp {
  clientId: string
  clientName: string | null
  firstConnectedAt: string
  lastUsedAt: string | null
}

// refresh_token grant마다 mcp_oauth_tokens 행이 새로 생기고 이전 행은 revoked_at으로 닫히므로
// (src/app/api/mcp/oauth/token/route.ts), client_id별로 묶어 "앱 하나"의 연결 상태로 보여준다.
// revoked_at이 null인 행이 하나도 없으면 그 client_id는 완전히 연결 해제된 것으로 보고 목록에서 제외.
function groupActiveConnections(rows: OAuthTokenRow[]): ConnectedApp[] {
  const byClient = new Map<string, OAuthTokenRow[]>()
  for (const row of rows) {
    const list = byClient.get(row.client_id)
    if (list) list.push(row)
    else byClient.set(row.client_id, [row])
  }

  const result: ConnectedApp[] = []
  for (const [clientId, clientRows] of byClient) {
    const isActive = clientRows.some((r) => !r.revoked_at)
    if (!isActive) continue

    const firstConnectedAt = clientRows.reduce(
      (min, r) => (r.created_at < min ? r.created_at : min),
      clientRows[0].created_at
    )
    const lastUsedAt = clientRows.reduce<string | null>((max, r) => {
      if (!r.last_used_at) return max
      if (!max || r.last_used_at > max) return r.last_used_at
      return max
    }, null)
    const clientName = clientRows.find((r) => r.mcp_oauth_clients?.client_name)?.mcp_oauth_clients?.client_name ?? null

    result.push({ clientId, clientName, firstConnectedAt, lastUsedAt })
  }

  return result.sort((a, b) => (a.firstConnectedAt < b.firstConnectedAt ? 1 : -1))
}

interface McpKeyManagerContentProps {
  lang: string
  userId: string
}

export default function McpKeyManagerContent({ lang, userId }: McpKeyManagerContentProps) {
  const isKo = lang === 'ko'
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [connections, setConnections] = useState<ConnectedApp[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 1500)
    return () => clearTimeout(timer)
  }, [copyState])

  const loadKeys = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('mcp_api_keys')
      .select('id, name, created_at, last_used_at, revoked_at')
      .order('created_at', { ascending: false })
    setKeys(data ?? [])
  }

  const loadConnections = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('mcp_oauth_tokens')
      .select('id, client_id, created_at, last_used_at, revoked_at, mcp_oauth_clients(client_name)')
      .order('created_at', { ascending: false })
    setConnections(groupActiveConnections(((data as unknown) as OAuthTokenRow[]) ?? []))
  }

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('mcp_api_keys')
      .select('id, name, created_at, last_used_at, revoked_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setKeys(data ?? []))
    supabase
      .from('mcp_oauth_tokens')
      .select('id, client_id, created_at, last_used_at, revoked_at, mcp_oauth_clients(client_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setConnections(groupActiveConnections(((data as unknown) as OAuthTokenRow[]) ?? [])))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    const rawKey = generateApiKey()
    const keyHash = await sha256Hex(rawKey)

    const supabase = createClient()
    const { error } = await supabase.from('mcp_api_keys').insert({
      user_id: userId,
      key_hash: keyHash,
      name: newKeyName.trim() || (isKo ? '이름 없는 키' : 'Untitled Key'),
    })

    if (error) console.error('Failed to create API key', error)

    if (!error) {
      setRevealedKey(rawKey)
      setNewKeyName('')
      await loadKeys()
    }
    setIsCreating(false)
  }

  const handleRevoke = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('mcp_api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
    await loadKeys()
  }

  const handleDisconnect = async (clientId: string) => {
    const supabase = createClient()
    await supabase
      .from('mcp_oauth_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .is('revoked_at', null)
    await loadConnections()
  }

  const handleCopy = async () => {
    if (!revealedKey) return
    const ok = await copyToClipboard(revealedKey)
    setCopyState(ok ? 'copied' : 'error')
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
        {isKo ? '연결된 앱' : 'Connected apps'}
      </p>

      <div className="space-y-1.5 mb-6">
        {connections.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {isKo ? 'OAuth로 연결된 앱이 아직 없습니다.' : 'No apps connected via OAuth yet.'}
          </p>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.clientId}
              className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Link2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--secondary)' }} />
                <div className="overflow-hidden">
                  <p className="text-sm truncate" style={{ color: 'var(--foreground)' }}>
                    {conn.clientName || (isKo ? '이름 없는 앱' : 'Unnamed app')}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '연결일' : 'Connected'} {new Date(conn.firstConnectedAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}
                    {conn.lastUsedAt &&
                      ` · ${isKo ? '마지막 사용' : 'Last used'} ${new Date(conn.lastUsedAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDisconnect(conn.clientId)}
                className="p-1.5 rounded-sm cursor-pointer shrink-0"
                style={{ color: 'var(--destructive)' }}
                title={isKo ? '연결 해제' : 'Disconnect'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
        {isKo ? 'API 키' : 'API Keys'}
      </p>

      {revealedKey && (
        <div
          className="mb-3 p-3 rounded-md"
          style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--secondary-light)' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--primary)' }}>
            {isKo
              ? '이 키는 지금만 표시됩니다. 안전한 곳에 복사해두세요.'
              : 'This key is shown only once. Copy it somewhere safe.'}
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-xs px-2 py-1.5 overflow-x-auto whitespace-nowrap select-text rounded-sm"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              {revealedKey}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-sm cursor-pointer shrink-0"
              style={{ color: copyState === 'error' ? 'var(--destructive)' : 'var(--secondary)' }}
              title={isKo ? '복사' : 'Copy'}
            >
              {copyState === 'copied' ? (
                <Check className="w-3.5 h-3.5" />
              ) : copyState === 'error' ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 mb-3">
        {keys.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {isKo ? '아직 발급된 키가 없습니다.' : 'No keys yet.'}
          </p>
        ) : (
          keys.map((key) => {
            const isRevoked = !!key.revoked_at
            return (
              <div
                key={key.id}
                className="flex items-center justify-between px-3 py-2 rounded-md"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <KeyRound className="w-3.5 h-3.5 shrink-0" style={{ color: isRevoked ? 'var(--border-strong)' : 'var(--secondary)' }} />
                  <div className="overflow-hidden">
                    <p
                      className="text-sm truncate"
                      style={{ color: isRevoked ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: isRevoked ? 'line-through' : 'none' }}
                    >
                      {key.name}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                      {isKo ? '생성' : 'Created'} {new Date(key.created_at).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}
                      {key.last_used_at &&
                        ` · ${isKo ? '마지막 사용' : 'Last used'} ${new Date(key.last_used_at).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}`}
                      {isRevoked && ` · ${isKo ? '폐기됨' : 'Revoked'}`}
                    </p>
                  </div>
                </div>
                {!isRevoked && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(key.id)}
                    className="p-1.5 rounded-sm cursor-pointer shrink-0"
                    style={{ color: 'var(--destructive)' }}
                    title={isKo ? '폐기' : 'Revoke'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-1.5">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder={isKo ? '키 이름 (예: 내 ChatGPT)' : 'Key name (e.g. My ChatGPT)'}
          className="text-sm px-3 py-2 outline-none rounded-sm"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
        />
        <button
          type="submit"
          disabled={isCreating}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm font-medium text-xs cursor-pointer"
          style={{
            backgroundColor: isCreating ? 'var(--border-strong)' : 'var(--primary)',
            color: 'var(--primary-foreground)',
            cursor: isCreating ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {isKo ? '새 키 발급' : 'Create Key'}
        </button>
      </form>
    </div>
  )
}
