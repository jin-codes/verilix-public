import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { hasLocale } from '../dictionaries'
import { notFound } from 'next/navigation'
import McpPageClient from './mcp-page-client'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function McpPage({ params }: Props) {
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

  return (
    <McpPageClient lang={lang} userId={user.id} userEmail={user.email ?? ''} />
  )
}
