function dateSegments(s: string): number[] {
  return s.split(".").map((i) => parseInt(i, 10));
}

/**
 * Parses a date in the format DD.MM.YYYY
 */
export function parseFullDate(s: string): Date {
  const [day, month, year] = dateSegments(s);
  return new Date(year, month - 1, day);
}

/**
 * Parses a date in the format MM.YYYY
 */
export function parseShortDate(s: string): Date {
  const [month, year] = dateSegments(s);
  return new Date(year, month - 1, 1);
}

export function formatFullDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(" г.", "");
}

export function formatMonthYear(value: string, locale: string): string {
  const [year, month] = value.split("-").map((part) => parseInt(part, 10));
  const formatted = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  })
    .format(new Date(year, month - 1, 1))
    .replace(" г.", "");

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth();

  return `${day}.${month.toString().padStart(2, "0")}`;
}
