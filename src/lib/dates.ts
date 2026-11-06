import type { PrayerName, PrayerTimes } from '@/lib/types';

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + delta));
}

export function formatGregorian(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar', {
    calendar: 'gregory',
    dateStyle: 'full',
  }).format(date);
}

export function formatHijri(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar-SA', {
    calendar: 'islamic-umalqura',
    dateStyle: 'full',
  }).format(date);
}

export function greetingFor(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'تقبّل الله قيامك';
  if (h < 12) return 'صباح النور';
  if (h < 17) return 'طاب يومك';
  if (h < 20) return 'مساء الخير';
  return 'تقبّل الله طاعتك';
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isInQuietHours(now: Date, start: string, end: string): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s === e) return false;
  return s < e ? current >= s && current < e : current >= s || current < e;
}

export interface NextPrayer {
  name: PrayerName;
  at: Date;
  remainingMs: number;
}

export function nextPrayer(times: PrayerTimes, now: Date = new Date()): NextPrayer {
  for (const name of PRAYER_ORDER) {
    const [h, m] = times[name].split(':').map(Number);
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (at.getTime() > now.getTime()) {
      return { name, at, remainingMs: at.getTime() - now.getTime() };
    }
  }
  const [h, m] = times.fajr.split(':').map(Number);
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m);
  return { name: 'fajr', at, remainingMs: at.getTime() - now.getTime() };
}

export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} دقيقة`;
  if (m === 0) return `${h} ساعة`;
  return `${h} ساعة و${m} دقيقة`;
}
