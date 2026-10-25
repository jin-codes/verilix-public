// English demo data. Mirrors notes-data.ts (Korean): same ids/categories/dates/relations.
import type { DemoCategory, DemoDocument } from '../notes-data'
import { DEMO_DOCUMENTS_EN_1 } from './part1'
import { DEMO_DOCUMENTS_EN_2 } from './part2'
import { DEMO_DOCUMENTS_EN_3 } from './part3'
import { DEMO_DOCUMENTS_EN_4 } from './part4'
import { DEMO_DOCUMENTS_EN_5 } from './part5'

export const DEMO_PERSONA_EN = {
  name: 'Hayoon Jung',
  role: 'Senior Product Manager at a B2B SaaS startup',
  bio: "Switched jobs 6 months ago and is still settling into a new team. On weekends, training for a half marathon and building a habit-tracker app as a side project.",
}

export const DEMO_CATEGORIES_EN: DemoCategory[] = [
  { id: 'cat-product', name: 'Product Management' },
  { id: 'cat-career', name: 'Career Growth' },
  { id: 'cat-sideproject', name: 'Side Project' },
  { id: 'cat-finance', name: 'Personal Finance' },
  { id: 'cat-running', name: 'Running & Health' },
  { id: 'cat-cooking', name: 'Cooking & Life' },
  { id: 'cat-leadership', name: 'Team & Collaboration' },
  { id: 'cat-analytics', name: 'Data & Experiments' },
  { id: 'cat-travel', name: 'Travel' },
  { id: 'cat-reading', name: 'Reading & Self-improvement' },
  { id: 'cat-techtrends', name: 'AI & Tech Trends' },
  { id: 'cat-home', name: 'Home & Living Alone' },
  { id: 'cat-language', name: 'English Study' },
  { id: 'cat-mental', name: 'Burnout & Mental Care' },
]

export const DEMO_DOCUMENTS_EN: DemoDocument[] = [
  ...DEMO_DOCUMENTS_EN_1,
  ...DEMO_DOCUMENTS_EN_2,
  ...DEMO_DOCUMENTS_EN_3,
  ...DEMO_DOCUMENTS_EN_4,
  ...DEMO_DOCUMENTS_EN_5,
]
