'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { InviteSetup } from '@/components/auth/InviteSetup'
import { PasswordReset } from '@/components/auth/PasswordReset'
import { SuccessScreen } from '@/components/ui/primitives'

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
      {/* Background blur - mais sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-sasi-red/8 via-sasi-blue/5 to-transparent rounded-full blur-3xl" />

      {/* Geometric shapes flutuantes */}
      <div className="absolute top-[15%] left-[8%] w-5 h-5 border border-sasi-blue/20 rotate-45 hidden md:block animate-float" />
      <div className="absolute top-[25%] right-[12%] w-8 h-8 border border-sasi-red/10 rounded-lg hidden md:block animate-float" style={{animationDelay:'1.2s'}} />
      <div className="absolute bottom-[20%] left-[15%] w-3 h-3 bg-sasi-blue/10 rounded-full hidden md:block animate-float" style={{animationDelay:'2.8s'}} />
      <div className="absolute bottom-[30%] right-[8%] w-6 h-6 border border-white/5 rotate-12 hidden md:block animate-float" style={{animationDelay:'2s'}} />
      <div className="absolute top-[60%] left-[5%] w-4 h-4 bg-sasi-red/8 rounded-full hidden md:block animate-float" style={{animationDelay:'3.5s'}} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
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
          <SuccessScreen
            title="Cadastro realizado!"
            message="Sua conta foi criada. Faça login para acessar o dashboard."
            buttonLabel="Fazer login"
            onClick={() => setStep('login')}
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
            title="Conta Criada!"
            message="Sua senha foi definida. Faça login para acessar o dashboard."
            buttonLabel="Fazer login"
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
            title="Senha Alterada!"
            message="Você já pode fazer login com sua nova senha."
            buttonLabel="Fazer login"
            onClick={() => setStep('login')}
          />
        )}
      </div>
    </div>
  )
}
