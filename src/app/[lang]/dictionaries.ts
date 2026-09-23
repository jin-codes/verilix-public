import 'server-only'

const dictionaries = {
  ko: () => import('../dictionaries/ko.json').then((m) => m.default),
  en: () => import('../dictionaries/en.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
