import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language } from '../types';
import { translations, getTranslations } from '../data/translations';

export interface LanguageContextType {
  currentLang: Language;
  lang: Language;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  onSelectLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  strings: Record<string, string>;
  translations: Record<Language, Record<string, string>>;
}

const STORAGE_KEY = 'diavet_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: ReactNode;
  initialLang?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLang }) => {
  const [currentLang, setCurrentLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'fr' || saved === 'en' || saved === 'ar') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'fr';
  });

  const dir: 'rtl' | 'ltr' = currentLang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  const applyDomAttributes = useCallback((lang: Language) => {
    const root = document.documentElement;
    const body = document.body;
    const isAr = lang === 'ar';
    const direction: 'rtl' | 'ltr' = isAr ? 'rtl' : 'ltr';

    root.setAttribute('dir', direction);
    root.setAttribute('lang', lang);
    if (body) {
      body.setAttribute('dir', direction);
      body.setAttribute('lang', lang);
    }

    if (lang === 'ar') {
      document.title = "DiaVet Algérie — المنصة الوطنية الموحدة للصحة الحيوانية 🇩🇿";
    } else if (lang === 'en') {
      document.title = "DiaVet Algeria — Unified Animal Health Platform 🇩🇿";
    } else {
      document.title = "DiaVet Algérie — La Plateforme Unifiée de Santé Animale 🇩🇿";
    }

    window.dispatchEvent(
      new CustomEvent('diavet_language_change', {
        detail: { lang, dir: direction }
      })
    );
  }, []);

  useEffect(() => {
    applyDomAttributes(currentLang);
  }, [currentLang, applyDomAttributes]);

  const setLanguage = useCallback((newLang: Language) => {
    setCurrentLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore storage errors
    }
    applyDomAttributes(newLang);
  }, [applyDomAttributes]);

  const strings = getTranslations(currentLang);

  const t = useCallback((key: string, fallback?: string): string => {
    if (strings && key in strings && strings[key]) {
      return strings[key];
    }
    if (fallback !== undefined) {
      return fallback;
    }
    return key;
  }, [strings]);

  const value: LanguageContextType = {
    currentLang,
    lang: currentLang,
    dir,
    isRTL,
    setLanguage,
    onSelectLang: setLanguage,
    t,
    strings,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguageContext = useLanguage;
export const useLang = useLanguage;
