'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  type?: ToastType
  message: string
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)
let toastSeq = 0

const TOAST_STYLES: Record<ToastType, { icon: React.ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 size={15} className="text-emerald-500" />, ring: 'border-emerald-500/30' },
  error: { icon: <XCircle size={15} className="text-red-500" />, ring: 'border-red-500/30' },
  warning: { icon: <AlertTriangle size={15} className="text-yellow-500" />, ring: 'border-yellow-500/30' },
  info: { icon: <Info size={15} className="text-blue-500" />, ring: 'border-blue-500/30' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = (message: string, type: ToastType = 'info') => {
    const id = ++toastSeq
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map(t => {
          const style = TOAST_STYLES[t.type ?? 'info']
          return (
            <div key={t.id} className={`glass-dropdown flex items-start gap-2.5 px-4 py-3 rounded-xl border animate-dropdownIn max-w-sm ${style.ring}`}>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="absolute top-1 right-1 text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <p className="text-sm text-foreground">{t.message}</p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}