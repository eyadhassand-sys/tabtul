import type { TasbeehPhrase } from '@/lib/types';

export const TASBEEH_PHRASES: TasbeehPhrase[] = [
  { id: 'subhanallah', text: 'سُبْحَانَ اللَّهِ' },
  { id: 'alhamdulillah', text: 'الْحَمْدُ لِلَّهِ' },
  { id: 'allahuakbar', text: 'اللَّهُ أَكْبَرُ' },
  { id: 'la-ilaha', text: 'لَا إِلَهَ إِلَّا اللَّهُ' },
  { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ' },
  { id: 'salawat', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ ﷺ' },
];

export const TASBEEH_TARGETS = [33, 99, 100, 500] as const;
