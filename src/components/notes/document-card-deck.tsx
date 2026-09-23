'use client'

import React, { useRef, useState } from 'react'
import { FileText, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import type { DocumentSummary } from './use-document-browser'

interface DocumentCardDeckProps {
  lang: string
  documents: DocumentSummary[]
  onOpenDocument: (id: string) => void
  emptyMessage: string
}

const SWIPE_X_THRESHOLD = 80
const SWIPE_UP_THRESHOLD = 60
const TAP_MAX_DIST = 8

export default function DocumentCardDeck({ lang, documents, onOpenDocument, emptyMessage }: DocumentCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const safeIndex = documents.length === 0 ? 0 : Math.min(currentIndex, documents.length - 1)
  const current = documents[safeIndex]
  const behind1 = documents[safeIndex + 1]
  const behind2 = documents[safeIndex + 2]

  const goTo = (delta: number) => {
    setCurrentIndex((i) => {
      const base = Math.min(i, documents.length - 1)
      return Math.min(Math.max(base + delta, 0), documents.length - 1)
    })
  }

  const resetDrag = () => {
    setDragX(0)
    setDragY(0)
    setIsDragging(false)
    startRef.current = null
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return
    setDragX(e.clientX - startRef.current.x)
    setDragY(e.clientY - startRef.current.y)
  }

  const handlePointerUp = () => {
    if (!startRef.current) {
      resetDrag()
      return
    }
    const dx = dragX
    const dy = dragY
    const dist = Math.hypot(dx, dy)

    if (dy < -SWIPE_UP_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      if (current) onOpenDocument(current.id)
      resetDrag()
      return
    }

    if (dist <= TAP_MAX_DIST) {
      if (current) onOpenDocument(current.id)
      resetDrag()
      return
    }

    if (dx > SWIPE_X_THRESHOLD) {
      setIsDragging(false)
      setExiting('right')
      setTimeout(() => {
        setExiting(null)
        setDragX(0)
        setDragY(0)
        goTo(-1)
      }, 200)
      startRef.current = null
      return
    }

    if (dx < -SWIPE_X_THRESHOLD) {
      setIsDragging(false)
      setExiting('left')
      setTimeout(() => {
        setExiting(null)
        setDragX(0)
        setDragY(0)
        goTo(1)
      }, 200)
      startRef.current = null
      return
    }

    resetDrag()
  }

  if (documents.length === 0) {
    return (
      <p className="px-6 py-10 text-sm text-center leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {emptyMessage}
      </p>
    )
  }

  const flyDistance = 480
  const topTransform =
    exiting === 'left'
      ? `translate(-${flyDistance}px, ${dragY}px) rotate(-24deg)`
      : exiting === 'right'
        ? `translate(${flyDistance}px, ${dragY}px) rotate(24deg)`
        : `translate(${dragX}px, ${dragY}px) rotate(${dragX * 0.04}deg)`

  return (
    <div className="flex flex-col items-center px-6 py-6 gap-5">
      <div className="relative w-full max-w-sm" style={{ aspectRatio: '3 / 4' }}>
        {behind2 && (
          <div
            className="absolute inset-0 rounded-md"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              transform: 'translateY(16px) scale(0.92)',
              opacity: 0.5,
            }}
          />
        )}
        {behind1 && (
          <div
            className="absolute inset-0 rounded-md"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              transform: 'translateY(8px) scale(0.96)',
              opacity: 0.75,
            }}
          />
        )}
        {current && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 rounded-md flex flex-col p-5 cursor-grab active:cursor-grabbing select-none touch-none"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transform: topTransform,
              transition: isDragging ? 'none' : 'transform 200ms ease',
            }}
          >
            <FileText className="w-5 h-5 shrink-0" style={{ color: 'var(--secondary)' }} />
            <p
              className="mt-4 text-base font-semibold leading-snug overflow-hidden"
              style={{ color: 'var(--foreground)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
            >
              {current.title || (lang === 'ko' ? '제목 없음' : 'Untitled')}
            </p>
            <span className="mt-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(current.updated_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
            </span>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ko' ? '탭하거나 위로 스와이프해 열기' : 'Tap or swipe up to open'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => goTo(-1)}
          disabled={safeIndex === 0}
          title={lang === 'ko' ? '이전 문서' : 'Previous'}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ border: '1px solid var(--border)', color: 'var(--secondary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => current && onOpenDocument(current.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium cursor-pointer"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {lang === 'ko' ? '열기' : 'Open'}
        </button>

        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={safeIndex === documents.length - 1}
          title={lang === 'ko' ? '다음 문서' : 'Next'}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ border: '1px solid var(--border)', color: 'var(--secondary)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {safeIndex + 1} / {documents.length}
      </span>
    </div>
  )
}
