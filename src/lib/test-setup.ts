import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { pt } from './i18n/pt'

vi.mock('@/contexts/LanguageContext', () => {
  const dict = pt
  const t = (key: string, params?: Record<string, string | number>) => {
    let value = (dict as Record<string, string>)[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v))
      }
    }
    return value
  }
  return {
    useLang: () => ({ lang: 'pt', setLang: vi.fn(), t }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
    LanguageContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
  }
})
