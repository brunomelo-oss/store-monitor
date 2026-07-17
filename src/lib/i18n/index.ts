import { pt } from './pt'
import { en } from './en'
import { ar } from './ar'

export type LangCode = 'pt' | 'en' | 'ar'

export const LANG_CODES: LangCode[] = ['pt', 'en', 'ar']

export function isValidLangCode(code: unknown): code is LangCode {
  return typeof code === 'string' && LANG_CODES.includes(code as LangCode)
}

export const dictionaries: Record<LangCode, Record<string, string>> = { pt, en, ar }
