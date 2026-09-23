'use client'

import { useState } from 'react'

const STORAGE_KEY = 'verilix_list_collapsed'

export function usePersistedCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

  const toggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return { isCollapsed, toggle }
}
