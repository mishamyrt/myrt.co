import { defaultLocale, locales, type Locale } from "./locales";

export function localePathParam(locale: Locale): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}

export function localizedStaticPaths() {
  return locales.map((locale) => ({
    params: { lang: localePathParam(locale) },
    props: { locale },
  }));
}
