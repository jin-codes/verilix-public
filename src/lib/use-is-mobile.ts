'use client'

import { useEffect, useState } from 'react'

// Only safe inside subtrees already rendered with `next/dynamic(..., { ssr: false })`
// (chat/notes/settings layout wrappers) — there's no server render to mismatch against there,
// so reading `window` in the initializer is safe and avoids a one-frame flash of the wrong layout.
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = () => setIsMobile(mql.matches)
    handler()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}
