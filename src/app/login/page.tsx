'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { InviteSetup } from '@/components/auth/InviteSetup'
import { PasswordReset } from '@/components/auth/PasswordReset'

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<string>('login')
  const [inviteEmail, setInviteEmail] = useState('')

  if (user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-sasi-blue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sasi-red/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        {step === 'login' && (
          <LoginForm
            onSwitch={(s, data) => {
              if (s === 'invite' && data) { setInviteEmail(data); setStep('invite') }
              if (s === 'email') setStep('email')
              if (s === 'register') setStep('register')
            }}
            onSuccess={() => router.push('/')}
          />
        )}
        {step === 'register' && (
          <RegisterForm
            onSuccess={() => setStep('regSuccess')}
            onBack={() => setStep('login')}
          />
        )}
        {step === 'regSuccess' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <div className="text-lg font-semibold text-white">Cadastro realizado!</div>
            <div className="text-sm text-zinc-500">Sua conta foi criada. Faça login para acessar o dashboard.</div>
            <button className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 transition" onClick={() => setStep('login')}>
              Fazer login
            </button>
          </div>
        )}
        {step === 'invite' && (
          <InviteSetup
            email={inviteEmail}
            onSuccess={() => setStep('inviteSuccess')}
            onBack={() => setStep('login')}
          />
        )}
        {step === 'inviteSuccess' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <div className="text-lg font-semibold text-white">Conta criada!</div>
            <div className="text-sm text-zinc-500">Sua senha foi definida. Faça login para acessar o dashboard.</div>
            <button className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 transition" onClick={() => setStep('login')}>
              Fazer login
            </button>
          </div>
        )}
        {step === 'email' && (
          <PasswordReset
            onBack={() => setStep('login')}
            onSuccess={() => setStep('resetSuccess')}
          />
        )}
        {step === 'resetSuccess' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <div className="text-lg font-semibold text-white">Senha alterada com sucesso!</div>
            <div className="text-sm text-zinc-500">Você já pode fazer login com sua nova senha.</div>
            <button className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 transition" onClick={() => setStep('login')}>
              Fazer login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
