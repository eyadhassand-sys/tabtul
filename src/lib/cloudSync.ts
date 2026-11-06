import { normalizeAppData } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { AppData } from '@/lib/types';

export async function fetchCloudData(userId: string): Promise<{ data: AppData | null; error: string | null }> {
  const { data, error } = await supabase.from('user_app_data').select('data').eq('user_id', userId).maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data ? normalizeAppData(data.data) : null, error: null };
}

export async function pushCloudData(userId: string, appData: AppData): Promise<string | null> {
  const { error } = await supabase
    .from('user_app_data')
    .upsert({ user_id: userId, data: appData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return error ? error.message : null;
}

function maxByKey(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out = { ...a };
  for (const [key, value] of Object.entries(b)) {
    out[key] = Math.max(out[key] ?? 0, value);
  }
  return out;
}

export function mergeAppData(local: AppData, remote: AppData): AppData {
  const dhikrCounts: AppData['dhikrCounts'] = { ...local.dhikrCounts };
  for (const [day, counts] of Object.entries(remote.dhikrCounts)) {
    dhikrCounts[day] = maxByKey(dhikrCounts[day] ?? {}, counts);
  }
  return {
    ...remote,
    dhikrCounts,
    tasbeeh: {
      ...remote.tasbeeh,
      totals: maxByKey(local.tasbeeh.totals, remote.tasbeeh.totals),
    },
  };
}
