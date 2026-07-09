'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { InviteSetup } from '@/features/auth/components/InviteSetup'
import { PasswordReset } from '@/features/auth/components/PasswordReset'
import { SuccessScreen } from '@/components/ui/primitives'
import { useLang } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [step, setStep] = useState<string>('login')
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    if (user) router.push('/')
  }, [user, router])

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden login-root">
      <div className="login-bg" />
      <div className="login-overlay" />
      <div className="login-vignette" />
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
          background-image: url('/assets/fundo-floresta.png');
          background-size: cover; background-position: center;
          background-repeat: no-repeat; background-attachment: fixed;
          animation: bgFadeIn 1s ease;
        }

        .login-overlay {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(rgba(0,0,0,.52), rgba(0,0,0,.65));
          animation: bgFadeIn 1s ease;
        }

        .login-vignette {
          position: fixed; inset: 0; z-index: 1;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.4) 100%);
          pointer-events: none;
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
          background: rgba(255,255,255,.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 30px 80px rgba(0,0,0,.45);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          animation: loginFadeIn .6s ease .2s both;
        }

        .login-card img[alt="SASI"] {
          width: 208px;
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

      <div className="fixed top-6 left-0 right-0 z-10 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/70 tracking-wide select-none">
          {t('login.createdBy')}
        </span>
      </div>

      <div className="login-card relative w-full max-w-sm">
        {step === 'login' && (
          <LoginForm
            onSwitch={(s, data) => {
              if (s === 'invite' && data) { setInviteEmail(data); setStep('invite') }
              if (s === 'email') setStep('email')
              if (s === 'register') setStep('register')
            }}
            onSuccess={() => {}}
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
            title={t('success.registered.title')}
            message={t('success.registered.message')}
            buttonLabel={t('success.registered.button')}
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
            title={t('success.invite.title')}
            message={t('success.invite.message')}
            buttonLabel={t('success.registered.button')}
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
            buttonLabel={t('success.registered.button')}
            onClick={() => setStep('login')}
          />
        )}
      </div>
    </div>
  )
}
