import { sha256Hex } from '@/lib/mcp-key'
import { getMcpSupabaseClient } from '@/mcp/auth'

export function getAppOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function randomToken(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${prefix}_${hex}`
}

export function generateAuthorizationCode(): string {
  return randomToken('vlxc')
}

export function generateAccessToken(): string {
  return randomToken('vlxo')
}

export function generateRefreshToken(): string {
  return randomToken('vlxr')
}

export function generateClientId(): string {
  return randomToken('vlxcli')
}

// RFC 7636 PKCE S256: base64url(sha256(code_verifier)) === code_challenge
export async function verifyPkce(
  codeVerifier: string,
  codeChallenge: string
): Promise<boolean> {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64url = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return base64url === codeChallenge
}

interface OAuthClient {
  client_id: string
  redirect_uris: string[]
  client_name: string | null
}

export async function getOAuthClient(clientId: string): Promise<OAuthClient | null> {
  const supabase = getMcpSupabaseClient()
  const { data } = await supabase
    .from('mcp_oauth_clients')
    .select('client_id, redirect_uris, client_name')
    .eq('client_id', clientId)
    .single()
  return data
}

interface VerifiedOAuthToken {
  userId: string
  tokenId: string
  scopes: string[]
}

export async function verifyOAuthAccessToken(
  rawToken: string
): Promise<VerifiedOAuthToken | null> {
  const tokenHash = await sha256Hex(rawToken)
  const supabase = getMcpSupabaseClient()

  const { data } = await supabase
    .from('mcp_oauth_tokens')
    .select('id, user_id, scope, expires_at, revoked_at')
    .eq('access_token_hash', tokenHash)
    .single()

  if (!data || data.revoked_at) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null

  await supabase
    .from('mcp_oauth_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return {
    userId: data.user_id,
    tokenId: data.id,
    scopes: (data.scope || '').split(' ').filter(Boolean),
  }
}
