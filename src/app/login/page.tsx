'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { InviteSetup } from '@/features/auth/components/InviteSetup'
import { PasswordReset } from '@/features/auth/components/PasswordReset'
import { SuccessScreen } from '@/features/auth/components/primitives'
import { Spinner } from '@/components/ui/LoadingSkeleton'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [step, setStep] = useState<string>('login')
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    if (user) router.push('/')
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <AuthShell>
      {step === 'login' && (
        <LoginForm
          onSwitch={(s, data) => {
            if (s === 'invite' && data) { setInviteEmail(data); setStep('invite') }
            if (s === 'email') setStep('email')
          }}
          onSuccess={() => {}}
        />
      )}
      {step === 'invite' && (
        <InviteSetup
          email={inviteEmail}
          onSuccess={() => setStep('inviteSuccess')}
          onBack={() => setStep('login')}
        />
      )}
      {step === 'inviteSuccess' && (
        <SuccessScreen
          title={t('success.invite.title')}
          message={t('success.invite.message')}
          buttonLabel={t('success.invite.button')}
          onClick={() => setStep('login')}
        />
      )}
      {step === 'email' && (
        <PasswordReset
          onBack={() => setStep('login')}
          onSuccess={() => setStep('resetSuccess')}
        />
      )}
      {step === 'resetSuccess' && (
        <SuccessScreen
          title={t('success.reset.title')}
          message={t('success.reset.message')}
          buttonLabel={t('success.reset.button')}
          onClick={() => setStep('login')}
        />
      )}
    </AuthShell>
  )
}