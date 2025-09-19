"use client";
import { useEffect, useState } from "react";
import { getPlatforms, type Platform } from "@/services/platformsService";
import { getPlatformAnalyses, upsertPlatformAnalysis, type PlatformAnalysisPayload } from "@/services/platformAnalysisService";

export function usePlatforms(sessionId?: string) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, PlatformAnalysisPayload>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [pf, pa] = await Promise.all([getPlatforms(), getPlatformAnalyses(sessionId)]);
        if (!mounted) return;
        setPlatforms(pf || []);
        const map: Record<string, PlatformAnalysisPayload> = {};
        (pa || []).forEach((row: any) => {
          map[row.platform_id] = { ...row, platform_id: row.platform_id };
        });
        setAnalyses(map);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [sessionId]);

  const updateField = (pid: string, field: keyof PlatformAnalysisPayload, value: any) => {
    setAnalyses(prev => ({ ...prev, [pid]: { ...prev[pid], platform_id: pid, [field]: value } }));
  };

  const savePlatform = async (pid: string) => {
    if (!sessionId) return;
    try {
      setSavingId(pid);
      await upsertPlatformAnalysis(sessionId, analyses[pid]);
    } finally {
      setSavingId(null);
    }
  };

  return { platforms, analyses, updateField, savePlatform, loading, savingId };
}
