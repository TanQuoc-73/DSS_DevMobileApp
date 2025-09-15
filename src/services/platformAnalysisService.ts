import { supabase } from '@/lib/supabaseClient';

export interface PlatformAnalysisPayload {
  platform_id: string;
  cost_score?: number | null;
  time_score?: number | null;
  feasibility_score?: number | null;
  maintenance_score?: number | null;
  market_fit_score?: number | null;
  estimated_cost?: number | null;
  estimated_months?: number | null;
  risk_level?: 'low' | 'medium' | 'high' | null;
  total_score?: number | null;
}

export async function getPlatformAnalyses(sessionId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/platform-analysis`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch platform analysis');
  return res.json();
}

export async function upsertPlatformAnalysis(sessionId: string, payload: PlatformAnalysisPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/platform-analysis`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to save platform analysis');
  return res.json();
}
