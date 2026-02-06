/**
 * i18n (Internationalization) utilities
 * Use these functions to get translated text based on the current language
 */

import enTranslations from './en.json';
import arTranslations from './ar.json';

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof enTranslations;

const translations = {
  en: enTranslations,
  ar: arTranslations,
} as const;

/**
 * Get translated text for a given key
 * @param key - Translation key from en.json/ar.json
 * @param lang - Language code ('en' or 'ar')
 * @returns Translated string
 */
export function t(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key;
}

/**
 * Get the current language from URL or default to 'en'
 * Useful for Astro pages: const lang = getLanguageFromUrl(Astro.url)
 */
export function getLanguageFromUrl(url: URL): Language {
  const pathname = url.pathname;
  
  // Check if path starts with /ar/
  if (pathname.startsWith('/ar/') || pathname === '/ar') {
    return 'ar';
  }
  
  return 'en';
}

/**
 * Get translations object for a specific language
 * Useful when you need multiple translations at once
 */
export function getTranslations(lang: Language = 'en') {
  return translations[lang];
}

/**
 * Check if a given string is a valid language code
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'en' || lang === 'ar';
}
