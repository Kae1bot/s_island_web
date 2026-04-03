import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { I18nContext, loadLocale, saveLocale, makeT } from './index';
import type { Locale } from './types';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

  const setLocale = (l: Locale) => {
    saveLocale(l);
    setLocaleState(l);
  };

  const ctx = useMemo(() => ({
    locale,
    setLocale,
    t: makeT(locale),
  }), [locale]);

  return (
    <I18nContext.Provider value={ctx}>
      {children}
    </I18nContext.Provider>
  );
}
