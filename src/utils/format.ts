/**
 * Compact number formatting: 1234 → "1.2K", 1_200_000 → "1.2M"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Relative time: "2m ago", "3h ago", "4d ago"
 */
export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatMoney(amount: string | number | null | undefined, currencyCode: string | null | undefined, locale = 'fr-CM'): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(value) || !currencyCode) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(value);
}

export function formatPhone(phone: string, countryCallingCode?: string | null): string {
  const trimmed = phone.trim();
  if (!trimmed || trimmed.startsWith('+') || !countryCallingCode) return trimmed;
  return `${countryCallingCode} ${trimmed.replace(/^0+/, '')}`;
}

export function formatDate(date: string | Date, timezone?: string | null, locale = 'fr-CM'): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: timezone ?? undefined }).format(value);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}
