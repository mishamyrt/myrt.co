function dateSegments(s: string): number[] {
  return s.split(".").map((i) => parseInt(i, 10));
}

/**
 * Parses a date in the format DD.MM.YYYY
 */
export function parseFullDate(s: string): Date {
  const [day, month, year] = dateSegments(s);
  const date = new Date();
  date.setFullYear(year, month, day);
  return date;
}

/**
 * Parses a date in the format MM.YYYY
 */
export function parseShortDate(s: string): Date {
  const [month, year] = dateSegments(s);
  const date = new Date();
  date.setFullYear(year, month);
  return date;
}

const monthNames = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatCyrillicDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() - 1;
  const year = date.getFullYear();

  return `${day} ${monthNames[month]} ${year}`;
}

export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth();

  return `${day}.${month.toString().padStart(2, "0")}`;
}
