import { supabase } from '@/lib/supabaseClient';

export interface Platform {
  id: string;
  name: string;
  type: 'native' | 'cross_platform' | string;
  base_cost_multiplier?: number;
  base_time_multiplier?: number;
  learning_curve?: number;
  maintenance_complexity?: number;
  market_share_vn?: number;
  market_share_global?: number;
}

export async function getPlatforms(): Promise<Platform[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch('/api/platforms', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch platforms');
  return res.json();
}
