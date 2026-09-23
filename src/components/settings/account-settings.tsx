'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog'

interface AccountSettingsProps {
  lang: string
  userEmail: string
}

export default function AccountSettings({ lang, userEmail }: AccountSettingsProps) {
  const router = useRouter()
  const isKo = lang === 'ko'

  const [isSigningOut, setIsSigningOut] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${lang}/login`)
  }

  const handleDeleteAccount = async () => {
    setDeleteDialogOpen(false)
    setDeleteError(false)

    const res = await fetch('/api/account', { method: 'DELETE' })

    if (!res.ok) {
      setDeleteError(true)
      setTimeout(() => setDeleteError(false), 3000)
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${lang}`)
  }

  return (
    <section>
      <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {isKo ? '계정' : 'Account'}
      </h2>
      <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--neutral)' }}>
        {userEmail}
      </p>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center gap-1.5 py-2 px-4 rounded-sm font-medium text-xs cursor-pointer transition-all duration-150"
        style={{
          backgroundColor: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          cursor: isSigningOut ? 'not-allowed' : 'pointer',
        }}
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>
          {isSigningOut
            ? (isKo ? '로그아웃 중...' : 'Signing out...')
            : (isKo ? '로그아웃' : 'Sign out')}
        </span>
      </button>

      <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--destructive)' }}>
          {isKo ? '계정 탈퇴' : 'Delete account'}
        </h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--neutral)' }}>
          {isKo
            ? '탈퇴 시 이 계정으로 다시 로그인할 수 없습니다.'
            : 'You will no longer be able to sign in with this account.'}
        </p>

        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          className="py-2 px-4 rounded-sm font-medium text-xs cursor-pointer transition-all duration-150"
          style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
        >
          {isKo ? '계정 탈퇴' : 'Delete account'}
        </button>

        {deleteError && (
          <p className="mt-2 text-xs" style={{ color: 'var(--destructive)' }}>
            {isKo ? '탈퇴하지 못했습니다. 잠시 후 다시 시도해주세요.' : 'Failed to delete account. Please try again later.'}
          </p>
        )}
      </div>

      <ConfirmDeleteDialog
        lang={lang}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        itemLabel={isKo ? '계정' : 'account'}
      />
    </section>
  )
}
