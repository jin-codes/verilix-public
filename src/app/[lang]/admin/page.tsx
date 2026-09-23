import { notFound } from 'next/navigation'
import { hasLocale } from '../dictionaries'
import { requireAdmin } from '@/lib/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminDashboard, {
  type AdminUserStat,
  type AdminSecurityAlert,
  type AdminQualitySignal,
  type AdminDevComment,
  type AdminUserFeedback,
} from '@/components/admin/admin-dashboard'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function AdminPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  await requireAdmin(lang)

  const admin = createAdminClient()
  const [{ data: stats }, { data: alerts }, { data: signals }, { data: devComments }, { data: userFeedback }] =
    await Promise.all([
      admin.rpc('admin_user_stats'),
      admin.rpc('admin_security_alerts'),
      admin.rpc('admin_quality_signals'),
      admin.rpc('admin_dev_comments'),
      admin.rpc('admin_user_feedback'),
    ])

  return (
    <AdminDashboard
      lang={lang}
      stats={(stats ?? []) as AdminUserStat[]}
      alerts={(alerts ?? []) as AdminSecurityAlert[]}
      signals={(signals ?? []) as AdminQualitySignal[]}
      devComments={(devComments ?? []) as AdminDevComment[]}
      userFeedback={(userFeedback ?? []) as AdminUserFeedback[]}
    />
  )
}
