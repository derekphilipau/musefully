/**
 * Since most museum collection metadata is in a specific locale, there's no
 * easy way to offer a truly i18n experience.  For now, just ensure that
 * UI strings all originate from a translation dictionary.
 *
 * For a dynamic, server-only solution see:
 * https://beta.nextjs.org/docs/guides/internationalization#localization
 *
 */
import { siteConfig } from '@/config/site';
import en from './lang/en.json';
import es from './lang/es.json';

const dictionaries = {
  en,
  es,
};

export const getDictionary = () => dictionaries[siteConfig.defaultLocale];
