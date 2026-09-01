'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalState {
  title: string
  content: ReactNode
  size?: 'sm' | 'md' | 'lg'
  onClose?: () => void
}

interface ModalContextType {
  open: (state: ModalState) => void
  close: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const open = (state: ModalState) => setModal({ ...state, size: state.size ?? 'md' })
  const close = () => setModal(null)

  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  }

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className={`relative w-full ${sizes[modal.size ?? 'md']} sasi-card rounded-2xl shadow-2xl animate-dropdownIn max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">{modal.title}</h3>
              <button onClick={close} className="text-muted-foreground hover:text-foreground transition p-1" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {modal.content}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}