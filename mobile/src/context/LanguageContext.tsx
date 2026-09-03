import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, type Translations } from '@/i18n/en';
import { ar } from '@/i18n/ar';

type Language = 'en' | 'ar';

type LanguageContextValue = {
  language: Language;
  isArabic: boolean;
  t: Translations;
  toggleLanguage: () => void;
  selectLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ar',
  isArabic: true,
  t: ar,
  toggleLanguage: () => {},
  selectLanguage: () => {},
});

const STORAGE_KEY = 'app_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val: string | null) => {
      if (val === 'en') setLanguage('en');
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next: Language = prev === 'en' ? 'ar' : 'en';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const selectLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  // Memoized so a parent provider re-render doesn't hand every useLanguage
  // consumer a fresh object and cascade re-renders app-wide.
  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isArabic: language === 'ar',
      t: language === 'ar' ? ar : en,
      toggleLanguage,
      selectLanguage,
    }),
    [language, toggleLanguage, selectLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
