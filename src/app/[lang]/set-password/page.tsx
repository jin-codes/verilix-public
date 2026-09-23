import { redirect } from 'next/navigation'
import { hasLocale } from '../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SetPasswordForm from './SetPasswordForm'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function SetPasswordPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  return <SetPasswordForm lang={lang} />
}
