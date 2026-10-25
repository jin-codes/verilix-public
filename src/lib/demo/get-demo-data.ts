import {
  DEMO_CATEGORIES,
  DEMO_DOCUMENTS,
  DEMO_PERSONA,
  type DemoCategory,
  type DemoDocument,
} from './notes-data'
import { DEMO_CATEGORIES_EN, DEMO_DOCUMENTS_EN, DEMO_PERSONA_EN } from './en'

export interface DemoData {
  persona: { name: string; role: string; bio: string }
  categories: DemoCategory[]
  documents: DemoDocument[]
}

const KO: DemoData = { persona: DEMO_PERSONA, categories: DEMO_CATEGORIES, documents: DEMO_DOCUMENTS }
const EN: DemoData = { persona: DEMO_PERSONA_EN, categories: DEMO_CATEGORIES_EN, documents: DEMO_DOCUMENTS_EN }

// /en은 영어 데이터, 그 외(ko)는 한국어 데이터. 두 데이터셋은 id/카테고리/날짜/관계가 1:1로 같다.
export function getDemoData(lang: string): DemoData {
  return lang === 'en' ? EN : KO
}
