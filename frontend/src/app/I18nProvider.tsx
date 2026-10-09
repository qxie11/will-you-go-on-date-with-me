'use client';

import React, { useEffect, useState } from 'react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { resources } from '../locales';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Read locale from window object injected by layout.tsx
    const win = window as any;
    const locale = win.__LOCALE__ || 'ru';

    i18next
      .use(initReactI18next)
      .init({
        resources,
        lng: locale,
        fallbackLng: 'ru',
        interpolation: {
          escapeValue: false, // React already safe from xss
        },
      })
      .then(() => {
        setInitialized(true);
      });
  }, []);

  if (!initialized) {
    return null; // Wait for initialization so children don't call useTranslation too early
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
