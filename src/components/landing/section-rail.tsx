'use client'

import { useEffect, useState } from 'react'

interface RailItem {
  id: string
  label: string
}

export function SectionRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-45% 0px -45% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [items])

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Sections"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3"
    >
      {items.map(({ id, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className="group flex items-center gap-2.5 justify-end cursor-pointer"
          >
            <span
              className={`text-[11px] uppercase tracking-wider transition-opacity duration-200 ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`}
              style={{ color: 'var(--text-secondary)' }}
            >
              {label}
            </span>
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: isActive ? 10 : 7,
                height: isActive ? 10 : 7,
                backgroundColor: isActive ? 'var(--primary)' : 'var(--border-strong)',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
