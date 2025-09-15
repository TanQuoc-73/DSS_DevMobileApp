import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createServerClient(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
    }
  );
}

// Utility: geometric mean priority vector from pairwise map
function priorityFromPairs(ids: string[], pairs: Map<string, number>) {
  const n = ids.length;
  const geo: number[] = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const a = ids[i];
      const b = ids[j];
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      let val = pairs.get(key) ?? 1;
      if (a > b) val = 1 / val;
      geo[i] *= val;
    }
    geo[i] = Math.pow(geo[i], 1 / (n - 0));
  }
  const sum = geo.reduce((s, v) => s + v, 0) || 1;
  return geo.map((v) => v / sum);
}

// Random Index (Saaty) for n=1..10
const RI: Record<number, number> = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

function consistencyRatio(ids: string[], pairs: Map<string, number>, weights: number[]) {
  const n = ids.length;
  if (n <= 2) return 0;
  // Build comparison matrix A
  const A: number[][] = Array.from({ length: n }, () => new Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = ids[i];
      const b = ids[j];
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      let val = pairs.get(key) ?? 1;
      if (a > b) val = 1 / val;
      A[i][j] = val;
      A[j][i] = 1 / val;
    }
  }
  // Compute lambda_max approx: (Aw)_i / w_i averaged
  const Aw: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) Aw[i] += A[i][j] * weights[j];
  }
  const ratios = Aw.map((v, i) => v / weights[i]);
  const lambdaMax = ratios.reduce((s, v) => s + v, 0) / n;
  const CI = (lambdaMax - n) / (n - 1);
  const ri = RI[n] ?? 1.49;
  const CR = ri === 0 ? 0 : CI / ri;
  return CR;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient(req);

  // 1) Load level-1 criteria
  const { data: c1, error: e1 } = await supabase
    .from('ahp_criteria')
    .select('id, code, name')
    .eq('level', 1)
    .eq('active', true)
    .order('code');
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  const c1Ids = (c1 || []).map((c) => c.id);

  // 2) Load level-1 pairwise for session
  const { data: p1, error: ep1 } = await supabase
    .from('ahp_pairwise_comparisons')
    .select('criteria_i_id, criteria_j_id, comparison_value')
    .eq('session_id', id)
    .eq('criteria_level', 1);
  if (ep1) return NextResponse.json({ error: ep1.message }, { status: 500 });
  const p1Map = new Map<string, number>();
  (p1 || []).forEach((r) => {
    const key = r.criteria_i_id < r.criteria_j_id ? `${r.criteria_i_id}|${r.criteria_j_id}` : `${r.criteria_j_id}|${r.criteria_i_id}`;
    p1Map.set(key, Number(r.comparison_value));
  });

  // 3) Compute level-1 weights
  const w1 = priorityFromPairs(c1Ids, p1Map);
  const crLevel1 = consistencyRatio(c1Ids, p1Map, w1);

  // 4) For each parent criterion, compute level-2 weights
  const criteriaWeights: Record<string, number> = {}; // code->weight including expansion to subcriteria codes
  const subWeightsByParent: Record<string, { ids: string[]; weights: number[]; cr: number }> = {};

  for (const parentId of c1Ids) {
    const { data: children } = await supabase
      .from('ahp_criteria')
      .select('id, code, name')
      .eq('level', 2)
      .eq('parent_id', parentId)
      .order('code');
    const childIds = (children || []).map((c) => c.id);
    if (childIds.length === 0) continue;

    const { data: pairs } = await supabase
      .from('ahp_pairwise_comparisons')
      .select('criteria_i_id, criteria_j_id, comparison_value')
      .eq('session_id', id)
      .eq('criteria_level', 2)
      .eq('parent_criteria_id', parentId);
    const map = new Map<string, number>();
    (pairs || []).forEach((r) => {
      const key = r.criteria_i_id < r.criteria_j_id ? `${r.criteria_i_id}|${r.criteria_j_id}` : `${r.criteria_j_id}|${r.criteria_i_id}`;
      map.set(key, Number(r.comparison_value));
    });
    const w = priorityFromPairs(childIds, map);
    const cr = consistencyRatio(childIds, map, w);
    subWeightsByParent[parentId] = { ids: childIds, weights: w, cr };
  }

  // 5) Load platforms (alternatives)
  const { data: alts, error: eAlt } = await supabase
    .from('platforms')
    .select('id, name')
    .eq('active', true)
    .order('name');
  if (eAlt) return NextResponse.json({ error: eAlt.message }, { status: 500 });
  const altIds = (alts || []).map((a) => a.id);

  // 6) For each level-2 criteria compute alternative scores
  const alternativeScores: Record<string, Record<string, number>> = {}; // altId -> {criteriaCode: weight}
  const crByParent: Record<string, number> = {};

  for (const parentId of c1Ids) {
    const { data: children } = await supabase
      .from('ahp_criteria')
      .select('id, code')
      .eq('level', 2)
      .eq('parent_id', parentId)
      .order('code');
    const childIds = (children || []).map((c) => c.id);
    const childCodes = (children || []).map((c) => c.code);
    for (let idx = 0; idx < childIds.length; idx++) {
      const cid = childIds[idx];
      const code = childCodes[idx];
      const { data: evals } = await supabase
        .from('ahp_alternative_evaluations')
        .select('alternative_i_id, alternative_j_id, comparison_value')
        .eq('session_id', id)
        .eq('criteria_id', cid);
      const map = new Map<string, number>();
      (evals || []).forEach((r) => {
        const key = r.alternative_i_id < r.alternative_j_id ? `${r.alternative_i_id}|${r.alternative_j_id}` : `${r.alternative_j_id}|${r.alternative_i_id}`;
        map.set(key, Number(r.comparison_value));
      });
      const wAlt = priorityFromPairs(altIds, map);
      // Store
      for (let i = 0; i < altIds.length; i++) {
        const aId = altIds[i];
        alternativeScores[aId] = alternativeScores[aId] || {};
        alternativeScores[aId][code] = wAlt[i];
      }
    }
    crByParent[parentId] = subWeightsByParent[parentId]?.cr ?? 0;
  }

  // 7) Build criteria weights across codes (flatten)
  const { data: allCriteria } = await supabase
    .from('ahp_criteria')
    .select('id, code, level, parent_id')
    .eq('active', true);
  const codeById = new Map<string, { code: string; level: number; parent?: string | null }>();
  (allCriteria || []).forEach((c) => codeById.set(c.id, { code: c.code, level: c.level, parent: c.parent_id }));

  // Level 1 weights by id -> code
  const w1ById: Record<string, number> = {};
  c1Ids.forEach((cid, idx) => {
    const code = codeById.get(cid)?.code!;
    w1ById[code] = w1[idx];
  });

  // Level 2 weights (child) relative to parent
  const w2ByCode: Record<string, number> = {};
  for (const parentId of Object.keys(subWeightsByParent)) {
    const childIds = subWeightsByParent[parentId].ids;
    const weights = subWeightsByParent[parentId].weights;
    const parentCode = codeById.get(parentId)?.code!;
    for (let i = 0; i < childIds.length; i++) {
      const childCode = codeById.get(childIds[i])?.code!;
      w2ByCode[childCode] = w1ById[parentCode] * weights[i];
    }
  }

  // 8) Final scores for alternatives: sum over criteria codes
  const finalScores: Record<string, number> = {};
  for (const aId of altIds) {
    let sum = 0;
    for (const [code, w] of Object.entries(w2ByCode)) {
      const s = alternativeScores[aId]?.[code] ?? 0;
      sum += w * s;
    }
    finalScores[aId] = sum;
  }

  // 9) Build response and store ahp_results
  const consistency_ratios: Record<string, number> = { level1: crLevel1 };
  for (const parentId of Object.keys(crByParent)) {
    const parentCode = codeById.get(parentId)?.code!;
    consistency_ratios[parentCode] = crByParent[parentId];
  }

  const result = {
    criteria_weights: w2ByCode,
    alternative_scores: alternativeScores,
    final_scores: finalScores,
    consistency_ratios,
    calculation_method: 'geometric_mean',
  };

  // upsert into ahp_results
  const { error: upErr } = await supabase
    .from('ahp_results')
    .upsert({
      session_id: id,
      criteria_weights: result.criteria_weights,
      alternative_scores: result.alternative_scores,
      final_scores: result.final_scores,
      consistency_ratios: result.consistency_ratios,
      calculation_method: result.calculation_method,
    }, { onConflict: 'session_id' });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json(result);
}
