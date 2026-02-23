import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "./locales/en.json"
import fr from "./locales/fr.json"

const STORAGE_KEY = "cinema-guru-lng"

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) ?? undefined : undefined,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng)
  }
})

export default i18n
