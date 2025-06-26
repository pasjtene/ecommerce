// app/[lang]/dictionaries.ts
import 'server-only';

const translations = {
  en: () => import('./translations/en.json').then((module) => module.default),
  fr: () => import('./translations/fr.json').then((module) => module.default),
  es: () => import('./translations/es.json').then((module) => module.default),
};

export const getTranslation = async (locale: keyof typeof translations) => {
  return translations[locale]();
};