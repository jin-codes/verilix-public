import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { hasLocale } from '../dictionaries'
import { notFound } from 'next/navigation'
import SettingsPageClient from './settings-page-client'
import type { SettingsCategory } from '@/components/settings/settings-nav'

const VALID_CATEGORIES: SettingsCategory[] = ['general', 'documents', 'profile', 'byok', 'account']

interface Props {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function SettingsPage({ params, searchParams }: Props) {
  const { lang } = await params
  const { category } = await searchParams
  if (!hasLocale(lang)) notFound()

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'type_a_context, type_a_updated_at, ui_language, doc_language, is_admin, digest_enabled'
    )
    .eq('id', user.id)
    .single()

  const initialCategory = VALID_CATEGORIES.includes(category as SettingsCategory)
    ? (category as SettingsCategory)
    : 'general'

  return (
    <SettingsPageClient
      lang={lang}
      userId={user.id}
      userEmail={user.email ?? ''}
      initialCategory={initialCategory}
      initialContext={profile?.type_a_context ?? ''}
      initialUpdatedAt={profile?.type_a_updated_at ?? null}
      initialUiLanguage={profile?.ui_language === 'ko' ? 'ko' : 'en'}
      initialDocLanguage={profile?.doc_language === 'ko' ? 'ko' : 'en'}
      isAdmin={profile?.is_admin === true}
      initialDigestEnabled={profile?.digest_enabled ?? true}
    />
  )
}
