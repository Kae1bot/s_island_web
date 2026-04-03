import { createContext, useContext } from 'react';
import type { Translations, Locale, TranslationKey } from './types';
import { en } from './en';
import { zh } from './zh';

/** Registry — add new locales here */
export const LOCALES: Record<Locale, { label: string; dict: Translations }> = {
  en: { label: 'English', dict: en },
  zh: { label: '简体中文', dict: zh },
};

const STORAGE_KEY = 'spirit-island-locale';

export function loadLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in LOCALES) return stored as Locale;
  // Auto-detect from browser
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === 'zh') return 'zh';
  return 'en';
}

export function saveLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
}

// ── Context ────────────────────────────────────

interface I18nContextValue {
  readonly locale: Locale;
  readonly setLocale: (l: Locale) => void;
  readonly t: (key: TranslationKey, ...args: (string | number)[]) => string;
}

export const I18nContext = createContext<I18nContextValue>(null!);

export function useT() {
  return useContext(I18nContext);
}

/** Build a `t()` function for the given locale */
export function makeT(locale: Locale) {
  const dict = LOCALES[locale].dict;
  return function t(key: TranslationKey, ...args: (string | number)[]): string {
    let text = dict[key] ?? key;
    for (let i = 0; i < args.length; i++) {
      text = text.replace(`{${i}}`, String(args[i]));
    }
    return text;
  };
}

export type { Locale, TranslationKey, Translations };
