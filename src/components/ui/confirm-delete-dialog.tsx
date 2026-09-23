'use client'

import React from 'react'
import { AlertDialog } from 'radix-ui'

interface ConfirmDeleteDialogProps {
  lang: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemLabel?: string
}

export default function ConfirmDeleteDialog({
  lang,
  open,
  onOpenChange,
  onConfirm,
  itemLabel,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(26,26,24,0.35)' }}
        />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 font-sans rounded-lg"
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            padding: '20px',
          }}
        >
          <AlertDialog.Title
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            {lang === 'ko' ? '삭제하시겠습니까?' : 'Delete this item?'}
          </AlertDialog.Title>
          <AlertDialog.Description
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {lang === 'ko'
              ? `${itemLabel ? `"${itemLabel}"` : '이 항목'}은(는) 삭제 후 복구할 수 없습니다.`
              : `${itemLabel ? `"${itemLabel}"` : 'This item'} cannot be recovered once deleted.`}
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                {lang === 'ko' ? '취소' : 'Cancel'}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--tertiary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--destructive)')}
              >
                {lang === 'ko' ? '삭제' : 'Delete'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
