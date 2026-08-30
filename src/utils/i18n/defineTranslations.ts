import { locales, type Locale } from "./locales";

type StringShape<T> = {
  [Key in keyof T]: string;
};

type Translations<T> = {
  ru: T;
} & {
  [Language in Exclude<Locale, "ru">]: StringShape<T>;
};

/**
 * Component translation helper
 */
export function defineTranslations<
  const Source extends Record<string, string>,
>(translations: Translations<Source>): Translations<Source> {
  const dictionaries = translations as Record<
    Locale,
    Record<string, string> | undefined
  >;
  const sourceKeys = Object.keys(dictionaries.ru ?? {});

  for (const locale of locales) {
    const dictionary = dictionaries[locale];
    if (!dictionary) {
      throw new Error(`Missing component translations for locale: ${locale}`);
    }

    const keys = Object.keys(dictionary);
    const missingKeys = sourceKeys.filter((key) => !keys.includes(key));
    const extraKeys = keys.filter((key) => !sourceKeys.includes(key));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      throw new Error(
        `Component translation keys differ for ${locale}: ` +
          `missing [${missingKeys.join(", ")}], extra [${extraKeys.join(", ")}]`,
      );
    }
  }

  return translations;
}
