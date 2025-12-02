import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    // Replace placeholders with params
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }
    
    return value;
  };

  const toggleLanguage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLanguage(prev => prev === 'en' ? 'ar' : 'en');
      // Small delay to allow DOM to update before fading back in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300); // Wait for fade out
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, isTransitioning }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
