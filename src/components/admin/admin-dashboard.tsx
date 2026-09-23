import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import AdminSecurityAlerts from './admin-security-alerts'
import AdminQualitySignals from './admin-quality-signals'
import AdminDevComments from './admin-dev-comments'
import AdminUserFeedbackTable from './admin-user-feedback'

export interface AdminUserStat {
  id: string
  email: string | null
  display_name: string | null
  plan: string | null
  is_admin: boolean
  credits_total: number
  credits_used: number
  credits_reset_at: string
  created_at: string
  conversation_count: number
  document_count: number
}

export interface AdminSecurityAlert {
  id: string
  user_id: string | null
  user_email: string | null
  conversation_id: string | null
  conversation_title: string | null
  content: string
  reviewed: boolean
  created_at: string
}

export interface AdminQualitySignal {
  id: string
  user_id: string | null
  user_email: string | null
  conversation_id: string | null
  conversation_title: string | null
  signal_type: string
  content: string
  reviewed: boolean
  created_at: string
}

export interface AdminDevComment {
  id: string
  user_id: string | null
  user_email: string | null
  conversation_id: string | null
  conversation_title: string | null
  content: string
  reviewed: boolean
  created_at: string
}

export interface AdminUserFeedback {
  id: string
  user_id: string | null
  user_email: string | null
  content: string
  reviewed: boolean
  created_at: string
}

interface AdminDashboardProps {
  lang: string
  stats: AdminUserStat[]
  alerts: AdminSecurityAlert[]
  signals: AdminQualitySignal[]
  devComments: AdminDevComment[]
  userFeedback: AdminUserFeedback[]
}

function todayCreditsUsed(row: AdminUserStat): number {
  const today = new Date().toISOString().slice(0, 10)
  return row.credits_reset_at === today ? row.credits_used : 0
}

export default function AdminDashboard({ lang, stats, alerts, signals, devComments, userFeedback }: AdminDashboardProps) {
  const isKo = lang === 'ko'

  const totalUsers = stats.length
  const totalConversations = stats.reduce((sum, r) => sum + r.conversation_count, 0)
  const totalDocuments = stats.reduce((sum, r) => sum + r.document_count, 0)
  const totalCreditsToday = stats.reduce((sum, r) => sum + todayCreditsUsed(r), 0)
  const unreviewedAlerts = alerts.filter((a) => !a.reviewed).length
  const unreviewedSignals = signals.filter((s) => !s.reviewed).length
  const unreviewedDevComments = devComments.filter((c) => !c.reviewed).length
  const unreviewedUserFeedback = userFeedback.filter((f) => !f.reviewed).length

  const summaryCards = [
    { label: isKo ? '총 유저' : 'Total Users', value: totalUsers },
    { label: isKo ? '오늘 크레딧 사용' : "Today's Credits Used", value: totalCreditsToday },
    { label: isKo ? '총 대화' : 'Total Conversations', value: totalConversations },
    { label: isKo ? '총 문서' : 'Total Documents', value: totalDocuments },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="h-14 px-8 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {isKo ? '관리자 대시보드' : 'Admin Dashboard'}
          </span>
        </div>
        <Link
          href={`/${lang}/mcp`}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-sm cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isKo ? '앱으로 돌아가기' : 'Back to app'}
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        <div className="grid grid-cols-8 gap-4">
          <div
            className="rounded-md p-4"
            style={{
              backgroundColor: 'var(--card)',
              border: unreviewedAlerts > 0 ? '1px solid var(--destructive)' : '1px solid var(--border)',
            }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {isKo ? '미확인 보안 알림' : 'Unreviewed Alerts'}
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ color: unreviewedAlerts > 0 ? 'var(--destructive)' : 'var(--foreground)' }}
            >
              {unreviewedAlerts.toLocaleString()}
            </p>
          </div>
          <div
            className="rounded-md p-4"
            style={{
              backgroundColor: 'var(--card)',
              border: unreviewedSignals > 0 ? '1px solid var(--destructive)' : '1px solid var(--border)',
            }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {isKo ? '미확인 품질 신호' : 'Unreviewed Signals'}
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ color: unreviewedSignals > 0 ? 'var(--destructive)' : 'var(--foreground)' }}
            >
              {unreviewedSignals.toLocaleString()}
            </p>
          </div>
          <div
            className="rounded-md p-4"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {isKo ? '미확인 개발자 코멘트' : 'Unreviewed Dev Comments'}
            </p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {unreviewedDevComments.toLocaleString()}
            </p>
          </div>
          <div
            className="rounded-md p-4"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {isKo ? '미확인 유저 피드백' : 'Unreviewed User Feedback'}
            </p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {unreviewedUserFeedback.toLocaleString()}
            </p>
          </div>
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-md p-4"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                {card.label}
              </p>
              <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                {card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--sidebar)' }}>
                {[
                  isKo ? '이메일' : 'Email',
                  isKo ? '플랜' : 'Plan',
                  isKo ? '가입일' : 'Joined',
                  isKo ? '대화' : 'Conversations',
                  isKo ? '문서' : 'Documents',
                  isKo ? '오늘 크레딧' : "Today's Credits",
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--neutral)', borderBottom: '1px solid var(--border)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5" style={{ color: 'var(--foreground)' }}>
                    <span className="flex items-center gap-1.5">
                      {row.email}
                      {row.is_admin && (
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--destructive)' }} />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                    {row.plan ?? 'free'}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                    {row.created_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                    {row.conversation_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                    {row.document_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                    {todayCreditsUsed(row)} / {row.credits_total}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/${lang}/admin/users/${row.id}`}
                      className="inline-flex items-center gap-1 text-xs cursor-pointer hover:underline"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {isKo ? '자세히' : 'Details'}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    {isKo ? '유저가 없습니다.' : 'No users yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? '보안 알림 (ALERT)' : 'Security Alerts'}
          </p>
          <AdminSecurityAlerts lang={lang} initialAlerts={alerts} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? '품질 신호 (LOW_CONFIDENCE / FEEDBACK_SIGNAL)' : 'Quality Signals'}
          </p>
          <AdminQualitySignals lang={lang} initialSignals={signals} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? '개발자 코멘트 (DEV_COMMENT)' : 'Developer Comments'}
          </p>
          <AdminDevComments lang={lang} initialComments={devComments} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? '유저 피드백' : 'User Feedback'}
          </p>
          <AdminUserFeedbackTable lang={lang} initialFeedback={userFeedback} />
        </div>
      </div>
    </div>
  )
}
