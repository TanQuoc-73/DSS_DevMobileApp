import { supabase } from '@/lib/supabaseClient';

export interface ProjectRequirementsPayload {
  budget_range?: '<200M' | '200-500M' | '>500M';
  budget_amount?: number | null;
  timeline_months?: number;
  timeline_priority?: 'flexible' | 'strict' | null;
  target_platform?: 'android_priority' | 'ios_priority' | 'both_equal' | null;
  target_market?: 'vietnam' | 'global' | 'asia' | null;
  expected_users?: number | null;
  total_developers?: number;
  android_developers?: number;
  ios_developers?: number;
  flutter_developers?: number;
  react_native_developers?: number;
  cost_priority?: number;
  speed_priority?: number;
  quality_priority?: number;
  maintenance_priority?: number;
}

export async function getRequirements(sessionId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/requirements`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function upsertRequirements(
  sessionId: string,
  payload: ProjectRequirementsPayload
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/requirements`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
