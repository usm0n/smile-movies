import React from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import translationUZ from '../languages/Uz.json';
import translationEN from '../languages/En.json';
import translationRus from '../languages/Ru.json';  
import { language } from '../utilities/defaultFunctions';

i18n
  .use(initReactI18next)
  .init({
    resources: {    
      uz: {translation: translationUZ},
      en:{translation: translationEN},
      ru: {translation: translationRus}
      
    },

    lng: language,
    fallbackLng: language,
    interpolation: {
      escapeValue: false
    }
  });

function TranslationProvider({ children }) {
  const { t } = useTranslation();


  return (
    <>
      {children}
    </>
  );
}

export default TranslationProvider;