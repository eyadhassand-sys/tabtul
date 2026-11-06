import { ADHKAR_CATEGORIES } from '@/data/adhkar';
import type { AdhkarCategoryId, Dhikr } from '@/lib/types';

export const DAILY_CATEGORY_IDS: AdhkarCategoryId[] = ['morning', 'evening'];

export function itemsForCategories(ids: AdhkarCategoryId[]): Dhikr[] {
  return ADHKAR_CATEGORIES.filter((c) => ids.includes(c.id)).flatMap((c) => c.items);
}

export function countCompleted(items: Dhikr[], getCount: (id: string) => number): number {
  return items.filter((item) => getCount(item.id) >= item.repeat).length;
}
