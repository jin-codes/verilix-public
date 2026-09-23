import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { InlineScript } from '@/components/inline-script'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'verilix',
  description: 'AI Knowledge Partner',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateStaticParams() {
  return [{ lang: 'ko' }, { lang: 'en' }]
}

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var isDark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.classList.add('dark')}catch(e){}})()`

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body className="min-h-full flex flex-col bg-bg font-sans">
        {children}
      </body>
    </html>
  )
}
