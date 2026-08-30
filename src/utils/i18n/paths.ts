import { type Locale, defaultLocale, locales } from "./locales";
import { getCollection, type CollectionEntry, type DataEntryMap } from "astro:content";

const localePrefixes = locales
  .map((locale) => `/${locale}`);

/**
 * Removes the locale prefix from the path.
 *
 * Returns default path for default locale.
 */
export function globalPath(localizedPathname: string): string {
  const localePrefix = localePrefixes.find((prefix) =>
    localizedPathname.startsWith(prefix)
  );
  if (localePrefix) {
    const stripped = localizedPathname.slice(localePrefix.length);
    return stripped || "/";
  }
  return localizedPathname;
}

/**
 * Removes the locale prefix from the slug.
 */
export function globalSlug(localizedSlug: string): string {
  return globalPath('/' + localizedSlug).slice(1);
}

/**
 * Adds the locale prefix to the path.
 * Path MUST be global (no locale prefix) or it will be added twice.
 *
 * If the locale is the default one, the path is returned as is.
 */
export function localizedPath(locale: Locale, pathname: string): string {
  return locale === defaultLocale ? pathname : `/${locale}${pathname}`;
}

/**
 * Generates static paths for all locales.
 *
 * Simplifies `getStaticPaths` construction.
 */
export function localizedStaticPaths() {
  return locales.map((locale) => ({
    params: { lang: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }));
}

/**
 * Extracts the locale from the content ID.
 */
export function contentLocale(id: string): Locale | undefined {
  const localeCode = id.slice(0, 2) as Locale;
  if (locales.includes(localeCode as Locale)) {
    return localeCode;
  }
}

/**
 * Gets a collection filtered by locale.
 */
export function getCollectionByLocale<C extends keyof DataEntryMap>(
  collection: C,
  locale: Locale,
): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, (entry) => contentLocale(entry.id) === locale)
}
