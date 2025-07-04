import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en";
import zh from "./locales/zh";

i18n
  .use(LanguageDetector) // 检测用户语言
  .use(initReactI18next) // 将 i18n 绑定到 react-i18next
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: "en", // 默认语言
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React 默认安全
    },
  });

export default i18n;
