import Link from 'next/link'
import type { LegalDoc } from '@/lib/legal/content'

export function LegalPage({
  doc,
  lang,
  updated,
}: {
  doc: LegalDoc
  lang: 'ko' | 'en'
  updated: string
}) {
  return (
    <main className="min-h-screen px-6 py-12" style={{ backgroundColor: 'var(--background)' }}>
      <article className="max-w-2xl mx-auto">
        <Link
          href={`/${lang}`}
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← verilix
        </Link>
        <h1 className="mt-6 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
          {doc.title}
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--neutral)' }}>
          {lang === 'ko' ? `시행일 ${updated}` : `Effective ${updated}`}
        </p>
        <p className="mt-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {doc.intro}
        </p>
        {doc.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              {s.heading}
            </h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {s.body.map((line, i) =>
                line.startsWith('- ') ? (
                  <p key={i} className="pl-4 -indent-3">
                    • {line.slice(2)}
                  </p>
                ) : (
                  <p key={i}>{line}</p>
                ),
              )}
            </div>
          </section>
        ))}
      </article>
    </main>
  )
}
