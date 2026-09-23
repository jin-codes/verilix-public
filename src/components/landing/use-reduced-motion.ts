'use client'

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the user's `prefers-reduced-motion` setting. Landing interactions use
 * this to fall back to a static end state instead of running rAF loops or
 * scroll-linked transforms. Initialised lazily from `matchMedia` (same pattern
 * as `Reveal`) so the effect only needs to subscribe to later changes.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
