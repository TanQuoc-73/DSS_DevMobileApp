"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPlatforms, type Platform } from "@/services/platformsService";
import { getPlatformAnalyses, upsertPlatformAnalysis, type PlatformAnalysisPayload } from "@/services/platformAnalysisService";

export default function SessionPlatformsPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params?.id;
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, PlatformAnalysisPayload>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const [pf, pa] = await Promise.all([
          getPlatforms(),
          getPlatformAnalyses(sessionId),
        ]);
        if (!mounted) return;
        setPlatforms(pf || []);
        const map: Record<string, PlatformAnalysisPayload> = {};
        (pa || []).forEach((row: any) => {
          map[row.platform_id] = {
            platform_id: row.platform_id,
            cost_score: row.cost_score ?? null,
            time_score: row.time_score ?? null,
            feasibility_score: row.feasibility_score ?? null,
            maintenance_score: row.maintenance_score ?? null,
            market_fit_score: row.market_fit_score ?? null,
            estimated_cost: row.estimated_cost ?? null,
            estimated_months: row.estimated_months ?? null,
            risk_level: row.risk_level ?? null,
            total_score: row.total_score ?? null,
          };
        });
        setAnalyses(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [sessionId]);

  const updateField = (platformId: string, field: keyof PlatformAnalysisPayload, value: any) => {
    setAnalyses(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        platform_id: platformId,
        [field]: value,
      },
    }));
  };

  const handleSave = async (platformId: string) => {
    if (!sessionId) return;
    try {
      setSavingId(platformId);
      const payload = analyses[platformId] || { platform_id: platformId };
      await upsertPlatformAnalysis(sessionId, payload);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Phân tích nền tảng</h1>
          <Link href={`/sessions/${sessionId}`} className="text-sm text-gray-300 hover:text-white">← Quay lại phiên</Link>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
          {loading ? (
            <div className="text-gray-400 text-sm">Đang tải danh sách nền tảng...</div>
          ) : platforms.length === 0 ? (
            <div className="text-gray-400 text-sm">Chưa có nền tảng nào khả dụng.</div>
          ) : (
            <div className="space-y-6">
              {platforms.map((pf) => {
                const a = analyses[pf.id] || { platform_id: pf.id } as PlatformAnalysisPayload;
                return (
                  <div key={pf.id} className="border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-white">{pf.name}</div>
                        <div className="text-xs text-gray-400">{pf.type}</div>
                      </div>
                      <button
                        onClick={() => handleSave(pf.id)}
                        disabled={savingId === pf.id}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60"
                      >
                        {savingId === pf.id ? 'Đang lưu...' : 'Lưu phân tích'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Cost score (0-100)</label>
                        <input type="number" min={0} max={100} value={a.cost_score ?? ''}
                          onChange={(e)=>updateField(pf.id,'cost_score', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Time score (0-100)</label>
                        <input type="number" min={0} max={100} value={a.time_score ?? ''}
                          onChange={(e)=>updateField(pf.id,'time_score', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Feasibility (0-100)</label>
                        <input type="number" min={0} max={100} value={a.feasibility_score ?? ''}
                          onChange={(e)=>updateField(pf.id,'feasibility_score', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Maintenance (0-100)</label>
                        <input type="number" min={0} max={100} value={a.maintenance_score ?? ''}
                          onChange={(e)=>updateField(pf.id,'maintenance_score', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Market fit (0-100)</label>
                        <input type="number" min={0} max={100} value={a.market_fit_score ?? ''}
                          onChange={(e)=>updateField(pf.id,'market_fit_score', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Ước tính chi phí</label>
                        <input type="number" min={0} value={a.estimated_cost ?? ''}
                          onChange={(e)=>updateField(pf.id,'estimated_cost', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Ước tính thời gian (tháng)</label>
                        <input type="number" min={0} step={0.1} value={a.estimated_months ?? ''}
                          onChange={(e)=>updateField(pf.id,'estimated_months', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rủi ro</label>
                        <select value={a.risk_level ?? ''}
                          onChange={(e)=>updateField(pf.id,'risk_level', (e.target.value||null) as any)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white">
                          <option value="">-- chọn --</option>
                          <option value="low">Thấp</option>
                          <option value="medium">Trung bình</option>
                          <option value="high">Cao</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Tổng điểm (0-100)</label>
                        <input type="number" min={0} max={100} value={a.total_score ?? ''}
                          onChange={(e)=>updateField(pf.id,'total_score', e.target.value===''? null : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
