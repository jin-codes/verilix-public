'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CategoryNode {
  id: string
  name: string
}

interface DocNode {
  id: string
  title: string | null
  summary: string | null
  updated_at: string
  tag_node_id: string | null
  related_document_ids: string[] | null
}

interface KnowledgeMindmapProps {
  lang: string
  onOpenDocument: (id: string) => void
  // 넘기면 Supabase 조회를 건너뛰고 이 데이터를 그대로 쓴다 (데모 페이지처럼 실 세션이 없는 화면용).
  staticData?: { categories: CategoryNode[]; documents: DocNode[] }
}

const CENTER = 50
const CATEGORY_RADIUS = 26
const DOC_RADIUS = 43
const DOC_RADIUS_INNER = 37
const DOC_RADIUS_OUTER = 49
const DOC_RING_SPLIT_THRESHOLD = 5
const MAX_DOC_SPREAD_DEG = 68
const UNCATEGORIZED_ID = '__uncategorized__'

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// --- 카테고리 라벨 배치 ---------------------------------------------------------------------
// 카테고리 수가 늘면 원 위에서 이웃 노드 간격이 좁아져(15개면 약 11 단위) 각도만으로 라벨 위치를
// 정하던 방식은 서로 겹치거나 좌우 끝에서 잘리고 문서 점을 덮는다. 글자 폭을 추정해 후보 위치들 중
// 이미 놓인 라벨/카테고리 점/문서 점/화면 가장자리와 겹치지 않는 곳을 고른다.
const LABEL_FONT_SIZE = 2.6
const LABEL_EDGE_MIN = 0.8
const LABEL_EDGE_MAX = 99.2
const LABEL_PAD = 0.5

type LabelAnchor = 'start' | 'middle' | 'end'
interface LabelPlacement { x: number; y: number; anchor: LabelAnchor }
interface Box { x0: number; y0: number; x1: number; y1: number }

// 브라우저 측정 없이 쓰는 근사 폭(SVG 단위). 한글/CJK는 전각, 대문자·넓은 글자는 약간 넓게 본다.
function estimateTextWidth(text: string, fontSize: number): number {
  let em = 0
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    if (code >= 0x1100) em += 1.0
    else if (ch === ' ') em += 0.3
    else if (/[MWmw@]/.test(ch)) em += 0.85
    else if (/[A-Z]/.test(ch)) em += 0.68
    else if (/[il.,'|!:;]/.test(ch)) em += 0.3
    else em += 0.56
  }
  return em * fontSize * 1.05
}

function textBox(x: number, y: number, anchor: LabelAnchor, width: number): Box {
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2
  return { x0, y0: y - LABEL_FONT_SIZE * 0.8, x1: x0 + width, y1: y + LABEL_FONT_SIZE * 0.3 }
}

function overlapArea(a: Box, b: Box, pad: number): number {
  const w = Math.min(a.x1 + pad, b.x1 + pad) - Math.max(a.x0 - pad, b.x0 - pad)
  const h = Math.min(a.y1 + pad, b.y1 + pad) - Math.max(a.y0 - pad, b.y0 - pad)
  return w > 0 && h > 0 ? w * h : 0
}

function outsideArea(b: Box): number {
  // 화면 밖으로 나간 만큼을 큰 가중치로 벌점 처리
  const overflowX = Math.max(0, LABEL_EDGE_MIN - b.x0) + Math.max(0, b.x1 - LABEL_EDGE_MAX)
  const overflowY = Math.max(0, 2 - b.y0) + Math.max(0, b.y1 - 98)
  return (overflowX + overflowY) * 20
}

function placeCategoryLabels(
  categories: { id: string; name: string; x: number; y: number; angle: number }[],
  docs: { x: number; y: number }[]
): Map<string, LabelPlacement> {
  const result = new Map<string, LabelPlacement>()
  const obstacles: Box[] = []
  for (const c of categories) obstacles.push({ x0: c.x - 3.6, y0: c.y - 3.6, x1: c.x + 3.6, y1: c.y + 3.6 })
  for (const d of docs) obstacles.push({ x0: d.x - 1.9, y0: d.y - 1.9, x1: d.x + 1.9, y1: d.y + 1.9 })

  // 좌우 끝처럼 선택지가 적은 노드부터 놓아야 위/아래 노드가 남은 자리를 쓴다
  const order = [...categories].sort((a, b) => Math.abs(Math.cos((b.angle * Math.PI) / 180)) - Math.abs(Math.cos((a.angle * Math.PI) / 180)))
  const placed: Box[] = []

  for (const c of order) {
    const cos = Math.cos((c.angle * Math.PI) / 180)
    const sin = Math.sin((c.angle * Math.PI) / 180)
    const width = estimateTextWidth(c.name, LABEL_FONT_SIZE)
    const side = cos > 0 ? 1 : -1
    const gap = 4.4

    const sideOut: LabelPlacement = { x: c.x + side * gap, y: c.y + 1, anchor: side > 0 ? 'start' : 'end' }
    const sideIn: LabelPlacement = { x: c.x - side * gap, y: c.y + 1, anchor: side > 0 ? 'end' : 'start' }
    const above: LabelPlacement = { x: c.x, y: c.y - 4.8, anchor: 'middle' }
    const below: LabelPlacement = { x: c.x, y: c.y + 6.4, anchor: 'middle' }
    const diagonals: LabelPlacement[] = [
      { x: c.x - 1.5, y: c.y - 4.8, anchor: 'end' },
      { x: c.x + 1.5, y: c.y - 4.8, anchor: 'start' },
      { x: c.x - 1.5, y: c.y + 6.4, anchor: 'end' },
      { x: c.x + 1.5, y: c.y + 6.4, anchor: 'start' },
    ]
    const vertical = sin > 0 ? [below, above] : [above, below]
    const candidates =
      Math.abs(cos) >= 0.3 ? [sideOut, ...vertical, sideIn, ...diagonals] : [...vertical, sideOut, sideIn, ...diagonals]

    let best: LabelPlacement = candidates[0]
    let bestScore = Infinity
    for (const cand of candidates) {
      const box = textBox(cand.x, cand.y, cand.anchor, width)
      let score = outsideArea(box)
      for (const o of obstacles) score += overlapArea(box, o, LABEL_PAD)
      for (const p of placed) score += overlapArea(box, p, LABEL_PAD) * 3
      if (score < bestScore) {
        bestScore = score
        best = cand
      }
      if (score === 0) break
    }
    result.set(c.id, best)
    placed.push(textBox(best.x, best.y, best.anchor, width))
  }
  return result
}

export default function KnowledgeMindmap({ lang, onOpenDocument, staticData }: KnowledgeMindmapProps) {
  const [categories, setCategories] = useState<CategoryNode[]>(() => staticData?.categories ?? [])
  const [documents, setDocuments] = useState<DocNode[]>(() => staticData?.documents ?? [])
  const [loading, setLoading] = useState(() => !staticData)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocNode | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragStateRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 })
  }, [selectedDoc?.id])

  const handleDragPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, origX: dragOffset.x, origY: dragOffset.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!dragStateRef.current) return
    const { startX, startY, origX, origY } = dragStateRef.current
    setDragOffset({ x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) })
  }

  const handleDragPointerUp = (e: React.PointerEvent) => {
    dragStateRef.current = null
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    }
  }

  useEffect(() => {
    if (staticData) return
    const supabase = createClient()
    Promise.all([
      supabase.from('tag_nodes').select('id, name').eq('depth', 1).order('name', { ascending: true }),
      supabase
        .from('documents')
        .select('id, title, summary, updated_at, tag_node_id, related_document_ids')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(300),
    ]).then(([tagRes, docRes]) => {
      setCategories(tagRes.data ?? [])
      setDocuments(docRes.data ?? [])
      setLoading(false)
    })
  }, [staticData])

  useEffect(() => {
    if (!selectedDoc) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedDoc(null)
    }
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setSelectedDoc(null)
    }
    document.addEventListener('keydown', handleKey)
    // 'click' (not 'mousedown') so a doc node's own onClick — which calls
    // e.stopPropagation() — never reaches this listener, avoiding a
    // close-then-reopen flicker when clicking straight from one node to another.
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('click', handleClick)
    }
  }, [selectedDoc])

  const groups = useMemo(() => {
    const byTag = new Map<string, DocNode[]>()
    const uncategorized: DocNode[] = []
    for (const doc of documents) {
      if (doc.tag_node_id) {
        const arr = byTag.get(doc.tag_node_id) ?? []
        arr.push(doc)
        byTag.set(doc.tag_node_id, arr)
      } else {
        uncategorized.push(doc)
      }
    }
    const list = categories
      .map((c) => ({ id: c.id, name: c.name, docs: byTag.get(c.id) ?? [] }))
      .filter((g) => g.docs.length > 0)
    if (uncategorized.length > 0) {
      list.push({ id: UNCATEGORIZED_ID, name: lang === 'ko' ? '미분류' : 'Uncategorized', docs: uncategorized })
    }
    return list
  }, [categories, documents, lang])

  const layout = useMemo(() => {
    const n = groups.length
    const categoryPositions: { id: string; name: string; x: number; y: number; angle: number }[] = []
    const docPositions: { doc: DocNode; groupId: string; x: number; y: number }[] = []
    if (n === 0) return { categoryPositions, docPositions, labelPlacements: new Map<string, LabelPlacement>() }

    const slotAngle = 360 / n
    groups.forEach((group, i) => {
      const angle = i * slotAngle - 90
      const cPos = polar(CENTER, CENTER, CATEGORY_RADIUS, angle)
      categoryPositions.push({ id: group.id, name: group.name, x: cPos.x, y: cPos.y, angle })

      const docCount = group.docs.length
      const spread = Math.min(slotAngle * 0.82, MAX_DOC_SPREAD_DEG)
      const splitRings = docCount >= DOC_RING_SPLIT_THRESHOLD
      group.docs.forEach((doc, j) => {
        const docAngle = docCount === 1 ? angle : angle - spread / 2 + (spread * j) / (docCount - 1)
        const radius = splitRings ? (j % 2 === 0 ? DOC_RADIUS_OUTER : DOC_RADIUS_INNER) : DOC_RADIUS
        const dPos = polar(CENTER, CENTER, radius, docAngle)
        docPositions.push({ doc, groupId: group.id, x: dPos.x, y: dPos.y })
      })
    })

    const labelPlacements = placeCategoryLabels(categoryPositions, docPositions)
    return { categoryPositions, docPositions, labelPlacements }
  }, [groups])

  const docPosMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (const d of layout.docPositions) map.set(d.doc.id, { x: d.x, y: d.y })
    return map
  }, [layout])

  const activeDocId = useMemo(() => {
    if (selectedDoc) return selectedDoc.id
    if (hoveredId && layout.docPositions.some((d) => d.doc.id === hoveredId)) return hoveredId
    return null
  }, [selectedDoc, hoveredId, layout])

  const activeLinks = useMemo(() => {
    if (!activeDocId) return []
    const doc = documents.find((d) => d.id === activeDocId)
    if (!doc?.related_document_ids?.length) return []
    const from = docPosMap.get(activeDocId)
    if (!from) return []
    return doc.related_document_ids
      .map((relId) => {
        const to = docPosMap.get(relId)
        return to ? { id: relId, from, to } : null
      })
      .filter((v): v is { id: string; from: { x: number; y: number }; to: { x: number; y: number } } => v !== null)
  }, [activeDocId, documents, docPosMap])

  const activeLinkTargetIds = useMemo(() => new Set(activeLinks.map((l) => l.id)), [activeLinks])

  const activeGroupId = useMemo(() => {
    if (selectedDoc) return selectedDoc.tag_node_id ?? UNCATEGORIZED_ID
    if (!hoveredId) return null
    if (layout.categoryPositions.some((c) => c.id === hoveredId)) return hoveredId
    const docPos = layout.docPositions.find((d) => d.doc.id === hoveredId)
    return docPos ? docPos.groupId : null
  }, [selectedDoc, hoveredId, layout])

  const selectedAnchor = useMemo(() => {
    if (!selectedDoc) return null
    const pos = layout.docPositions.find((d) => d.doc.id === selectedDoc.id)
    return pos ? { x: pos.x, y: pos.y } : null
  }, [selectedDoc, layout])

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {lang === 'ko' ? '지도를 그리는 중...' : 'Drawing the map...'}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="flex-1 h-full flex items-center justify-center px-8">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            {lang === 'ko' ? '아직 그릴 지도가 없어요' : 'Nothing to map yet'}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'ko'
              ? '대화가 문서로 쌓이면 주제별로 방사형 지도에 나타납니다.'
              : 'Once conversations become documents, they will appear here as a radial map by topic.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full flex items-center justify-center px-6 py-6 select-none">
      <div ref={containerRef} className="relative" style={{ width: 'min(100%, 680px)', aspectRatio: '1 / 1' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <filter id="mindmap-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {layout.categoryPositions.map((c) => {
            const active = activeGroupId === null || activeGroupId === c.id
            return (
              <line
                key={`line-root-${c.id}`}
                x1={CENTER}
                y1={CENTER}
                x2={c.x}
                y2={c.y}
                stroke="var(--border-strong)"
                strokeWidth={active ? 0.35 : 0.2}
                opacity={activeGroupId === null ? 0.55 : active ? 0.9 : 0.12}
                style={{ transition: 'opacity 300ms ease, stroke-width 300ms ease' }}
              />
            )
          })}

          {layout.docPositions.map(({ doc, groupId, x, y }) => {
            const cat = layout.categoryPositions.find((c) => c.id === groupId)
            if (!cat) return null
            const active = activeGroupId === null || activeGroupId === groupId
            return (
              <line
                key={`line-doc-${doc.id}`}
                x1={cat.x}
                y1={cat.y}
                x2={x}
                y2={y}
                stroke="var(--border)"
                strokeWidth={active ? 0.22 : 0.15}
                opacity={activeGroupId === null ? 0.4 : active ? 0.75 : 0.06}
                style={{ transition: 'opacity 300ms ease' }}
              />
            )
          })}

          <circle cx={CENTER} cy={CENTER} r={1.6} fill="var(--primary)" className="mindmap-pulse" />

          {activeLinks.map((link) => {
            const mx = (link.from.x + link.to.x) / 2
            const my = (link.from.y + link.to.y) / 2
            const dx = mx - CENTER
            const dy = my - CENTER
            const dist = Math.hypot(dx, dy) || 1
            const bow = 6
            const ctrlX = mx + (dx / dist) * bow
            const ctrlY = my + (dy / dist) * bow
            return (
              <path
                key={`link-${link.id}`}
                d={`M ${link.from.x} ${link.from.y} Q ${ctrlX} ${ctrlY} ${link.to.x} ${link.to.y}`}
                fill="none"
                stroke="var(--destructive)"
                strokeWidth={0.5}
                strokeDasharray="1.2 1"
                opacity={0.85}
              />
            )
          })}

          {layout.categoryPositions.map((c) => {
            const isHovered = hoveredId === c.id
            const dim = activeGroupId !== null && activeGroupId !== c.id
            const label = layout.labelPlacements.get(c.id) ?? { x: c.x, y: c.y - 4.8, anchor: 'middle' as const }
            return (
              <g
                key={c.id}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId((h) => (h === c.id ? null : h))}
                style={{ opacity: dim ? 0.28 : 1, transition: 'opacity 300ms ease' }}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 3.6 : 3}
                  fill="var(--primary)"
                  filter={isHovered ? 'url(#mindmap-glow)' : undefined}
                  style={{ transition: 'r 200ms ease' }}
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight={600}
                  fill="var(--foreground)"
                  style={{ pointerEvents: 'none' }}
                >
                  {c.name}
                </text>
              </g>
            )
          })}

          {layout.docPositions.map(({ doc, x, y, groupId }) => {
            const isHovered = hoveredId === doc.id
            const isSelected = selectedDoc?.id === doc.id
            const isLinkTarget = activeLinkTargetIds.has(doc.id)
            const dim = activeGroupId !== null && activeGroupId !== groupId && !isLinkTarget
            const nodeStyle: React.CSSProperties = {
              cursor: 'pointer',
              opacity: dim ? 0.22 : 1,
              transition: 'opacity 300ms ease',
            }
            return (
              <g
                key={doc.id}
                onMouseEnter={() => setHoveredId(doc.id)}
                onMouseLeave={() => setHoveredId((h) => (h === doc.id ? null : h))}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDoc(doc)
                }}
                style={nodeStyle}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected || isLinkTarget ? 1.9 : 1.3}
                  fill={
                    isSelected
                      ? 'var(--primary-light)'
                      : isHovered
                        ? 'var(--primary)'
                        : isLinkTarget
                          ? 'var(--destructive)'
                          : 'var(--secondary)'
                  }
                  filter={isHovered || isSelected || isLinkTarget ? 'url(#mindmap-glow)' : undefined}
                  style={{ transition: 'r 180ms ease, fill 180ms ease' }}
                />
                <title>{doc.title || (lang === 'ko' ? '제목 없음' : 'Untitled')}</title>
              </g>
            )
          })}
        </svg>

        {selectedDoc && selectedAnchor && (
          <div
            ref={popoverRef}
            onPointerDown={handleDragPointerDown}
            onPointerMove={handleDragPointerMove}
            onPointerUp={handleDragPointerUp}
            className="absolute z-20 w-64 p-3.5 rounded-md"
            style={{
              left: `${Math.min(84, Math.max(16, selectedAnchor.x))}%`,
              top: `${selectedAnchor.y}%`,
              transform: `${
                selectedAnchor.y < 38 ? 'translate(-50%, 14px)' : 'translate(-50%, calc(-100% - 14px))'
              } translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>
              {selectedDoc.title || (lang === 'ko' ? '제목 없음' : 'Untitled')}
            </p>
            {selectedDoc.summary && (
              <p
                className="mt-1.5 text-xs leading-relaxed"
                style={{
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {selectedDoc.summary}
              </p>
            )}
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {new Date(selectedDoc.updated_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
              </span>
              <button
                type="button"
                onClick={() => onOpenDocument(selectedDoc.id)}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-sm cursor-pointer"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {lang === 'ko' ? '열기' : 'Open'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
