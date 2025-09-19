// src/hooks/useAHP.ts
"use client";

import { useEffect, useState } from "react";
import { getCriteria, getPairwise, upsertPairwise, getAltPairwise, upsertAltPairwise, calculateAhp, upsertRecommendation, type AhpCriterion } from "@/services/ahpService";

export function useAHP(sessionId?: string) {
  const [criteriaL1, setCriteriaL1] = useState<AhpCriterion[]>([]);
  const [pairwiseL1, setPairwiseL1] = useState<Record<string, number>>({});
  const [criteriaL2, setCriteriaL2] = useState<AhpCriterion[]>([]);
  const [pairwiseL2, setPairwiseL2] = useState<Record<string, number>>({});
  const [criteriaAllL2, setCriteriaAllL2] = useState<AhpCriterion[]>([]);
  const [altPairwise, setAltPairwise] = useState<Record<string, number>>({});
  const [ahpResult, setAhpResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Load criteria L1 + pairwise
  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    const load = async () => {
      const [c, pairs] = await Promise.all([getCriteria(1), getPairwise(sessionId, 1)]);
      if (!mounted) return;
      setCriteriaL1(c || []);
      const map: Record<string, number> = {};
      (pairs || []).forEach((p: any) => {
        const key = p.criteria_i_id < p.criteria_j_id ? `${p.criteria_i_id}|${p.criteria_j_id}` : `${p.criteria_j_id}|${p.criteria_i_id}`;
        map[key] = Number(p.comparison_value);
      });
      setPairwiseL1(map);
    };
    load();
    return () => { mounted = false; };
  }, [sessionId]);

  // Load all level-2 criteria
  useEffect(() => {
    let mounted = true;
    getCriteria(2).then((list) => { if (mounted) setCriteriaAllL2(list || []); });
    return () => { mounted = false; };
  }, []);

  const savePairwiseL1 = async () => {
    if (!sessionId || criteriaL1.length < 2) return;
    const items: any[] = [];
    for (let a = 0; a < criteriaL1.length; a++) {
      for (let b = a + 1; b < criteriaL1.length; b++) {
        const iId = criteriaL1[a].id;
        const jId = criteriaL1[b].id;
        const key = `${iId}|${jId}`;
        items.push({ criteria_level: 1, parent_criteria_id: null, criteria_i_id: iId, criteria_j_id: jId, comparison_value: pairwiseL1[key] ?? 1 });
      }
    }
    await upsertPairwise(sessionId, items);
  };

  const savePairwiseL2 = async (parentId: string) => {
    if (!sessionId || !parentId || criteriaL2.length < 2) return;
    const items: any[] = [];
    for (let a = 0; a < criteriaL2.length; a++) {
      for (let b = a + 1; b < criteriaL2.length; b++) {
        const iId = criteriaL2[a].id;
        const jId = criteriaL2[b].id;
        const key = `${iId}|${jId}`;
        items.push({ criteria_level: 2, parent_criteria_id: parentId, criteria_i_id: iId, criteria_j_id: jId, comparison_value: pairwiseL2[key] ?? 1 });
      }
    }
    await upsertPairwise(sessionId, items);
  };

  const saveAltPairs = async (criteriaId: string, platforms: string[]) => {
    if (!sessionId || !criteriaId || platforms.length < 2) return;
    const items: any[] = [];
    for (let a = 0; a < platforms.length; a++) {
      for (let b = a + 1; b < platforms.length; b++) {
        const key = `${platforms[a]}|${platforms[b]}`;
        items.push({ criteria_id: criteriaId, alternative_i_id: platforms[a], alternative_j_id: platforms[b], comparison_value: altPairwise[key] ?? 1 });
      }
    }
    await upsertAltPairwise(sessionId, items);
  };

  const calculate = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await calculateAhp(sessionId);
      setAhpResult(res);
    } finally {
      setLoading(false);
    }
  };

  const saveRecommendation = async (bestId: string, confidence: number, rationale?: string) => {
    if (!sessionId) return;
    await upsertRecommendation(sessionId, { recommended_platform_id: bestId, confidence, rationale: rationale || null });
  };

  return {
    criteriaL1, pairwiseL1, setPairwiseL1, savePairwiseL1,
    criteriaL2, setCriteriaL2, pairwiseL2, setPairwiseL2, savePairwiseL2,
    criteriaAllL2, altPairwise, setAltPairwise, saveAltPairs,
    ahpResult, calculate, saveRecommendation,
    loading,
  };
}
