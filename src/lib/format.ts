const DAY_MS = 24 * 60 * 60 * 1000;

/** Used for every date and number, and by the date picker, so formats stay consistent. */
export const LOCALE = 'en-GB';

/** Normalises a calendar date to local noon, so serialising it never shifts the day. */
export function toStoredDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).toISOString();
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Local calendar-day key (YYYY-MM-DD) for ordering and comparing readings. */
export function dayKey(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysSince(iso: string, now = new Date()) {
  return Math.round((startOfDay(now).getTime() - startOfDay(new Date(iso)).getTime()) / DAY_MS);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeDay(iso: string) {
  const days = daysSince(iso);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
}

export function formatUnits(value: number) {
  return `${value.toLocaleString(LOCALE, { maximumFractionDigits: 2 })} units`;
}

export function formatMoney(amount: number, symbol: string) {
  return `${symbol}${amount.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRate(rate: number, symbol: string) {
  return `${symbol}${rate.toLocaleString(LOCALE, { maximumFractionDigits: 2 })}/unit`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

/** Parses user-typed numbers; returns undefined for blank or invalid input. */
export function parseNumber(input: string) {
  const trimmed = input.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}
