'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'auth' | 'surface'
}

const variants = {
  auth: 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 focus:border-sasi-red/50 focus:bg-slate-200 dark:focus:bg-white/[0.12]',
  surface: 'bg-surface border-border focus:border-sasi-red/50',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'auth', className = '', ...props }, ref) => (
    <input
      ref={ref}
       className={`w-full px-4 py-3 rounded-lg border text-foreground placeholder:text-muted-foreground text-sm outline-none transition ${variants[variant]} ${className}`}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Senha',
  variant = 'auth',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  variant?: 'auth' | 'surface'
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        variant={variant}
        onChange={e => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function SubmitButton({
  loading,
  children,
  disabled,
}: {
  loading?: boolean
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function BackButton({ onClick, label = '← Voltar' }: { onClick: () => void; label?: string }) {
  return (
    <button className="text-xs text-muted-foreground hover:text-foreground transition w-full text-center" onClick={onClick}>
      {label}
    </button>
  )
}

export function SuccessScreen({
  title,
  message,
  buttonLabel,
  onClick,
}: {
  title: string
  message: string
  buttonLabel: string
  onClick: () => void
}) {
  return (
    <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
        <div className="text-3xl text-emerald-400 font-bold">✓</div>
      </div>
      <div className="text-lg font-semibold text-foreground dark:text-white">{title}</div>
      <div className="text-sm text-muted-foreground">{message}</div>
      <button onClick={onClick} className="w-full py-3 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-sasi-red/20">
        {buttonLabel}
      </button>
    </div>
  )
}
