'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { App } from '@/types'

type ModalMode = 'edit' | 'add' | 'details'

interface ModalState {
  app: App | null
  mode: ModalMode
  region: string
}

interface ModalContextValue {
  modal: ModalState | null
  openModal: (state: ModalState) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextValue>(null!)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  return (
    <ModalContext.Provider value={{ modal, openModal: setModal, closeModal: () => setModal(null) }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be inside ModalProvider')
  return ctx
}
