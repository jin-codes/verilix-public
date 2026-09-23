import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { hasLocale } from '../dictionaries'
import { notFound } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function OnboardingPage({ params }: Props) {
  const { lang } = await params
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
    .select('type_a_context, ui_language, ai_response_language, doc_language, type_a_updated_at')
    .eq('id', user.id)
    .single()

  if (profile?.type_a_updated_at) {
    redirect(`/${lang}/mcp`)
  }

  return (
    <OnboardingForm
      lang={lang}
      userId={user.id}
      initialContext={profile?.type_a_context ?? ''}
      initialUiLanguage={profile?.ui_language === 'ko' ? 'ko' : 'en'}
      initialAiLanguage={profile?.ai_response_language === 'ko' ? 'ko' : 'en'}
      initialDocLanguage={profile?.doc_language === 'ko' ? 'ko' : 'en'}
    />
  )
}
