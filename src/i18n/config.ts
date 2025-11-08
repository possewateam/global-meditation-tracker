import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import bn from './locales/bn.json';
import pa from './locales/pa.json';
import kn from './locales/kn.json';
import or_locale from './locales/or.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  ml: { translation: ml },
  bn: { translation: bn },
  pa: { translation: pa },
  kn: { translation: kn },
  or: { translation: or_locale },
  ru: { translation: ru },
  de: { translation: de },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
