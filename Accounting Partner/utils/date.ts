import type { DateFormatKey } from '@/types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(iso: string, format: DateFormatKey): string {
  const d = parseISODate(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  switch (format) {
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'DD/MM/YYYY':
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}

export function formatDateLong(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDayLabel(iso: string): string {
  const d = parseISODate(iso);
  const today = todayISO();
  const yesterday = toISODate(addDays(new Date(), -1));
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function monthShortLabel(month: number): string {
  return MONTH_SHORT[month] ?? '';
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7; // Monday as start of week
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function getMonthNames(): string[] {
  return MONTH_NAMES;
}

export function getDateRangeForPreset(
  preset: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'thisYear',
): { start: string; end: string } {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { start: toISODate(now), end: toISODate(now) };
    case 'yesterday': {
      const y = addDays(now, -1);
      return { start: toISODate(y), end: toISODate(y) };
    }
    case 'thisWeek':
      return { start: toISODate(startOfWeek(now)), end: toISODate(now) };
    case 'thisMonth':
      return { start: toISODate(startOfMonth(now)), end: toISODate(now) };
    case 'thisYear':
      return { start: toISODate(startOfYear(now)), end: toISODate(now) };
    default:
      return { start: toISODate(now), end: toISODate(now) };
  }
}
