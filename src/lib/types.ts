export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type AdhkarCategoryId =
  | 'morning'
  | 'evening'
  | 'sleep'
  | 'waking'
  | 'prayer'
  | 'home'
  | 'mosque'
  | 'food'
  | 'travel'
  | 'quranic'
  | 'prophetic'
  | 'ablution'
  | 'toilet'
  | 'adhan'
  | 'istighfar'
  | 'salawat'
  | 'distress'
  | 'weather'
  | 'clothing'
  | 'iftar'
  | 'sick'
  | 'anger'
  | 'istikhara';

export interface Dhikr {
  id: string;
  text: string;
  repeat: number;
  source: string;
}

export interface AdhkarCategory {
  id: AdhkarCategoryId;
  title: string;
  subtitle: string;
  items: Dhikr[];
}

export type ReminderTypeId =
  | 'prayer'
  | 'istighfar'
  | 'salawat'
  | 'quran'
  | 'charity'
  | 'parents'
  | 'kinship'
  | 'gratitude'
  | 'akhlaq'
  | 'helping'
  | 'tawba'
  | 'adhkar'
  | 'dua'
  | 'witr'
  | 'goodness';

export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  enabledTypes: ReminderTypeId[];
  quietStart: string;
  quietEnd: string;
}

export type PrayerTimes = Record<PrayerName, string>;

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'md' | 'lg';
  sound: boolean;
  vibration: boolean;
  prayerTimes: PrayerTimes | null;
  reminders: ReminderSettings;
}

export interface TasbeehPhrase {
  id: string;
  text: string;
}

export interface TasbeehState {
  count: number;
  target: number;
  phraseId: string;
  totals: Record<string, number>;
}

export interface AppData {
  settings: Settings;
  dhikrCounts: Record<string, Record<string, number>>;
  tasbeeh: TasbeehState;
  lastReminderAt: number | null;
  lastReminderTypeId: ReminderTypeId | null;
}
