import Link from 'next/link'

export function LandingFooter({ tagline, lang }: { tagline: string; lang: string }) {
  return (
    <footer className="px-6 py-10" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            verilix
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {tagline}
          </span>
        </div>
        <nav className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Link href={`/${lang}/terms`}>{lang === 'ko' ? '이용약관' : 'Terms'}</Link>
          <Link href={`/${lang}/privacy`}>{lang === 'ko' ? '개인정보처리방침' : 'Privacy'}</Link>
          <a
            href="https://github.com/jin-codes/verilix-public"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
