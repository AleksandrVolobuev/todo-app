// src/js/i18n.js
import uk from '../../locales/uk.json';
import ru from '../../locales/ru.json';
import en from '../../locales/en.json';

const locales = { uk, ru, en };

let currentLang = 'uk';

export function setLanguage(lang) {
  if (locales[lang]) {
    currentLang = lang;
  }
}

export function t(key) {
  return locales[currentLang][key] || key;
}
