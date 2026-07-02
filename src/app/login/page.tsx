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
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-sasi-blue/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sasi-red/5 rounded-full blur-3xl animate-pulse" style={{animationDelay:'2s'}} />

      {/* Floating geometric shapes */}
      <div className="absolute top-1/4 left-[10%] w-4 h-4 border border-sasi-blue/20 rotate-45 hidden sm:block animate-float" />
      <div className="absolute top-1/3 right-[15%] w-6 h-6 border border-sasi-red/15 rounded-lg hidden sm:block animate-float" style={{animationDelay:'1s'}} />
      <div className="absolute bottom-1/4 left-[20%] w-3 h-3 bg-sasi-blue/10 rounded-full hidden sm:block animate-float" style={{animationDelay:'3s'}} />
      <div className="absolute bottom-1/3 right-[10%] w-5 h-5 border border-white/5 rotate-12 hidden sm:block animate-float" style={{animationDelay:'2.5s'}} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

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
