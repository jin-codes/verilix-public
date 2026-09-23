export function LandingFooter({ tagline, copyright }: { tagline: string; copyright: string }) {
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
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {copyright}
        </span>
      </div>
    </footer>
  )
}
