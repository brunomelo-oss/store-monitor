import { pt } from './pt'
import { en } from './en'
import { ar } from './ar'

export type LangCode = 'pt' | 'en' | 'ar'

export const dictionaries: Record<LangCode, Record<string, string>> = { pt, en, ar }
