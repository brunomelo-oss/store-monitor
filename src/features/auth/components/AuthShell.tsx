'use client'

import type { ReactNode } from 'react'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden login-root">
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
        .login-bg { display: block; }

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

        .login-card input {
          transition: all .2s ease;
        }

        .login-card button[type="submit"] {
          transition: all .25s ease;
        }
        .login-card button[type="submit"]:hover:not(:disabled) {
          box-shadow: 0 0 24px rgba(220,38,38,.35);
        }
      `}</style>

      <div className="fixed top-6 left-0 right-0 z-10 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-500 dark:text-white/70 tracking-wide select-none">
          Criado por Bruno | SASI Comunicação Ágil
        </span>
      </div>

      <div className="login-card relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}