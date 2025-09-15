import { supabase } from '@/lib/supabaseClient';

export interface AhpCriterion {
  id: string;
  code: string;
  name: string;
  level: number;
  description?: string | null;
  parent_id?: string | null;
}

export interface RecommendationPayload {
  recommended_platform_id: string;
  confidence: number; // 0..1
  rationale?: string | null;
}

export async function getRecommendation(sessionId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`/api/sessions/${sessionId}/recommendations`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch recommendation');
  return res.json();
}

export async function upsertRecommendation(sessionId: string, payload: RecommendationPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`/api/sessions/${sessionId}/recommendations`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save recommendation');
  return res.json();
}

export async function calculateAhp(sessionId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/ahp/calculate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to calculate AHP');
  return res.json();
}

// Alternatives vs Criteria
export interface AltPairwiseItem {
  criteria_id: string;
  alternative_i_id: string;
  alternative_j_id: string;
  comparison_value: number;
}

export async function getAltPairwise(sessionId: string, criteriaId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const params = new URLSearchParams();
  params.set('criteria_id', criteriaId);

  const res = await fetch(`/api/sessions/${sessionId}/ahp/alternatives?${params.toString()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch alternative pairwise');
  return res.json();
}

export async function upsertAltPairwise(sessionId: string, items: AltPairwiseItem | AltPairwiseItem[]) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/ahp/alternatives`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error('Failed to save alternative pairwise');
  return res.json();
}

export interface PairwiseItem {
  criteria_level: 1 | 2;
  parent_criteria_id?: string | null;
  criteria_i_id: string;
  criteria_j_id: string;
  comparison_value: number; // 0.111.. to 9
}

export async function getCriteria(level: 1 | 2, parentId?: string | null): Promise<AhpCriterion[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const params = new URLSearchParams();
  params.set('level', String(level));
  if (level === 2 && parentId) params.set('parent_id', parentId);

  const res = await fetch(`/api/ahp/criteria?${params.toString()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch AHP criteria');
  return res.json();
}

export async function getPairwise(sessionId: string, level: 1 | 2, parentId?: string | null) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const params = new URLSearchParams();
  params.set('level', String(level));
  if (level === 2 && parentId) params.set('parent_id', parentId);

  const res = await fetch(`/api/sessions/${sessionId}/ahp/pairwise?${params.toString()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch AHP pairwise');
  return res.json();
}

export async function upsertPairwise(sessionId: string, items: PairwiseItem | PairwiseItem[]) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${sessionId}/ahp/pairwise`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error('Failed to save AHP pairwise');
  return res.json();
}
