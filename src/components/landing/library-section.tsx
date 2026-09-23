'use client'

import { FileText, History, FolderTree, Search, Mail, Plug, type LucideIcon } from 'lucide-react'
import { Reveal } from './reveal'
import { SpotlightCard } from './spotlight-card'

const ICONS: LucideIcon[] = [FileText, History, FolderTree, Search, Mail, Plug]

interface FeatureItem {
  title: string
  description: string
}

export function LibrarySection({
  heading,
  subheading,
  items,
}: {
  heading: string
  subheading: string
  items: FeatureItem[]
}) {
  return (
    <section
      id="library"
      className="relative px-6 py-24 md:py-32"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-14 max-w-2xl">
          <h2
            className="font-semibold"
            style={{
              color: 'var(--foreground)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {heading}
          </h2>
          <p
            className="mt-4"
            style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}
          >
            {subheading}
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <Reveal
                key={item.title}
                delayMs={(i % 3) * 80}
                direction={i % 2 === 0 ? 'left' : 'right'}
              >
                <SpotlightCard
                  className="h-full rounded-lg p-6"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
                  >
                    <Icon size={18} color="var(--primary)" />
                  </div>
                  <h3
                    className="mt-4 font-semibold"
                    style={{ color: 'var(--foreground)', fontSize: '16px' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2"
                    style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.65 }}
                  >
                    {item.description}
                  </p>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
