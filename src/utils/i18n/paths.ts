import { defaultLocale, type Locale } from "./locales";

/**
 * Removes the locale prefix from the path.
 */
export function universalPath(path: string): string {
  if (path.startsWith("/en")) {
    const stripped = path.slice(3);
    return stripped || "/";
  }
  return path;
}

export function localizedPath(locale: Locale, pathname: string): string {
  return locale === defaultLocale ? pathname : `/${locale}${pathname}`;
}

export function articlePath(locale: Locale, slug: string): string {
  return localizedPath(locale, `/blog/${slug}/`);
}

export function contentLocale(id: string): Locale {
  return id.startsWith("en/") ? "en" : "ru";
}

export function contentSlug(id: string): string {
  return id.startsWith("en/") ? id.slice(3) : id;
}
