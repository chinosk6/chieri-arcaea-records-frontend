import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import transEN from './en/translation.json';
import transZhCN from './zh-cn/translation.json';

export const languages = [
    { value: 'zhCN', label: '简体中文' },
    { value: 'en', label: 'English' }
];

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'zhCN',
        debug: false,
        resources: {
            en: {
                translation: transEN,
            },
            zhCN: {
                translation: transZhCN
            }
        }
});