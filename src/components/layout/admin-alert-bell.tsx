'use client'

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SecurityAlert {
  id: string
  content: string
  conversation_id: string | null
  created_at: string
}

interface AdminAlertBellProps {
  lang: string
}

export default function AdminAlertBell({ lang }: AdminAlertBellProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('security_alerts')
        .select('id, content, conversation_id, created_at')
        .eq('reviewed', false)
        .order('created_at', { ascending: false })
      if (!cancelled) setAlerts(data ?? [])
    }

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) setChecked(true)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      if (cancelled) return
      if (profile?.is_admin === true) {
        setIsAdmin(true)
        await fetchAlerts()
      }
      setChecked(true)
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    const supabase = createClient()
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('security_alerts')
        .select('id, content, conversation_id, created_at')
        .eq('reviewed', false)
        .order('created_at', { ascending: false })
      setAlerts(data ?? [])
    }, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  const handleMarkReviewed = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('security_alerts').update({ reviewed: true }).eq('id', id)
    if (error) return
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  if (!checked || !isAdmin) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={lang === 'ko' ? '보안 알림' : 'Alerts'}
        className="relative flex items-center justify-center w-8 h-8 rounded-sm cursor-pointer transition-all duration-150"
        style={{
          backgroundColor: open ? 'var(--background)' : 'transparent',
        }}
      >
        <Bell
          className="w-4 h-4"
          style={{ color: open || alerts.length > 0 ? 'var(--foreground)' : 'var(--secondary)' }}
        />
        {alerts.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-semibold leading-none font-sans rounded-full"
            style={{
              minWidth: '15px',
              height: '15px',
              padding: '0 3px',
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
            }}
          >
            {alerts.length > 9 ? '9+' : alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 font-sans rounded-lg"
          style={{
            width: '320px',
            maxHeight: '360px',
            overflowY: 'auto',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            padding: '12px',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
            style={{ color: 'var(--neutral)' }}
          >
            {lang === 'ko' ? '보안 알림' : 'Security Alerts'}
          </p>
          {alerts.length === 0 ? (
            <p className="text-sm px-1 py-2" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ko' ? '확인할 알림이 없습니다.' : 'No alerts to review.'}
            </p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2.5 rounded-md"
                  style={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    {alert.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(alert.created_at).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                    <button
                      onClick={() => handleMarkReviewed(alert.id)}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    >
                      {lang === 'ko' ? '확인함' : 'Mark reviewed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
