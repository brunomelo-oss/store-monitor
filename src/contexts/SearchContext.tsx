'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface SearchContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const SearchContext = createContext<SearchContextType>({ open: false, setOpen: () => {}, toggle: () => {} })

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <SearchContext.Provider value={{ open, setOpen, toggle: () => setOpen(o => !o) }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  return useContext(SearchContext)
}
