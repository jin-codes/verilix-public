'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Continuous 0-1 progress for how far an element has scrolled through the
 * viewport (0 = element top just entered the bottom of the viewport,
 * 1 = element bottom just left the top). Unlike IntersectionObserver
 * threshold snapping, this updates every scroll frame for a scrubbed effect.
 */
export function useScrollScrub<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId: number | null = null

    const update = () => {
      rafId = null
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = rect.height + vh
      const traveled = vh - rect.top
      const next = total > 0 ? Math.min(1, Math.max(0, traveled / total)) : 0
      setProgress(next)
    }

    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  return { ref, progress }
}
