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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden login-root">
      <div className="login-bg" />
      <div className="login-overlay" />
      <div className="login-spotlight" />

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bgFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }

        .login-root { isolation: isolate; }

        .login-bg {
          position: fixed; inset: 0; z-index: 0;
          background-image: url('/assets/jungle-backgrounds.png.webp');
          background-size: cover; background-position: center;
          background-repeat: no-repeat; background-attachment: fixed;
          animation: bgFadeIn 1s ease;
        }

        .login-overlay {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(rgba(2,6,23,.78), rgba(2,6,23,.82));
          animation: bgFadeIn 1s ease;
        }

        .login-spotlight {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 640px; height: 640px; z-index: 2;
          background: radial-gradient(circle,rgba(255,255,255,.06),transparent 65%);
          pointer-events: none;
        }

        .login-card {
          position: relative; z-index: 3;
          background: rgba(10,15,25,.72);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 30px 80px rgba(0,0,0,.45);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          animation: loginFadeIn .6s ease .2s both;
        }

        .login-card img[alt="SASI"] {
          width: 208px;
          filter: drop-shadow(0 0 12px rgba(220,38,38,.25));
        }

        .login-card input {
          background: rgba(255,255,255,.08) !important;
          border-color: rgba(255,255,255,.12) !important;
          transition: all .2s ease;
        }
        .login-card input:focus {
          border-color: #DC2626 !important;
          box-shadow: 0 0 0 3px rgba(220,38,38,.15);
        }
        .login-card input::placeholder {
          color: rgba(255,255,255,.4) !important;
        }

        .login-card button[type="submit"] {
          transition: all .25s ease;
        }
        .login-card button[type="submit"]:hover:not(:disabled) {
          box-shadow: 0 0 24px rgba(220,38,38,.35);
        }
      `}</style>

      <div className="login-card relative w-full max-w-sm">
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
