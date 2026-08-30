export const locales = ["ru", "en"] as const;
export const defaultLocale: Locale = "ru";

export type Locale = (typeof locales)[number];
