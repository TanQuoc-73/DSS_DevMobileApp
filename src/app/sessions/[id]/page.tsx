"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, BarChart3 } from "lucide-react";
import { getSessionById } from "@/services/sessionService";
import { getRequirements, upsertRequirements, type ProjectRequirementsPayload } from "@/services/requirementsService";
import { getPlatforms, type Platform } from "@/services/platformsService";
import { getPlatformAnalyses, upsertPlatformAnalysis, type PlatformAnalysisPayload } from "@/services/platformAnalysisService";

interface Session {
  id: string;
  project_name?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSaving, setReqSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<ProjectRequirementsPayload>({
    budget_range: undefined,
    budget_amount: undefined,
    timeline_months: undefined,
    timeline_priority: null,
    target_platform: null,
    target_market: null,
    expected_users: undefined,
    total_developers: undefined,
    android_developers: 0,
    ios_developers: 0,
    flutter_developers: 0,
    react_native_developers: 0,
    cost_priority: 3,
    speed_priority: 3,
    quality_priority: 3,
    maintenance_priority: 3,
  });

  // Platform Analysis states (top-level hooks)
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [paLoading, setPaLoading] = useState(false);
  const [paSavingId, setPaSavingId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, PlatformAnalysisPayload>>({});

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      try {
        setLoading(true);
        const data = await getSessionById(params.id);
        setSession(data);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Không thể tải dữ liệu session");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  // Load requirements after session is ready
  useEffect(() => {
    let isMounted = true;
    const loadReqs = async () => {
      if (!params?.id) return;
      try {
        setReqLoading(true);
        const data = await getRequirements(params.id);
        if (!isMounted) return;
        if (data) {
          setRequirements({
            budget_range: data.budget_range ?? undefined,
            budget_amount: data.budget_amount ?? undefined,
            timeline_months: data.timeline_months ?? undefined,
            timeline_priority: data.timeline_priority ?? null,
            target_platform: data.target_platform ?? null,
            target_market: data.target_market ?? null,
            expected_users: data.expected_users ?? undefined,
            total_developers: data.total_developers ?? undefined,
            android_developers: data.android_developers ?? 0,
            ios_developers: data.ios_developers ?? 0,
            flutter_developers: data.flutter_developers ?? 0,
            react_native_developers: data.react_native_developers ?? 0,
            cost_priority: data.cost_priority ?? 3,
            speed_priority: data.speed_priority ?? 3,
            quality_priority: data.quality_priority ?? 3,
            maintenance_priority: data.maintenance_priority ?? 3,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!isMounted) return;
        setReqLoading(false);
      }
    };
    loadReqs();
    return () => {
      isMounted = false;
    };
  }, [params?.id]);

  // Load platforms and existing analyses (top-level effect)
  useEffect(() => {
    let isMounted = true;
    const loadPlatformsAndAnalyses = async () => {
      if (!params?.id) return;
      try {
        setPaLoading(true);
        const [pf, pa] = await Promise.all([
          getPlatforms(),
          getPlatformAnalyses(params.id),
        ]);
        if (!isMounted) return;
        setPlatforms(pf || []);
        const map: Record<string, PlatformAnalysisPayload> = {};
        (pa || []).forEach((row: any) => {
          map[row.platform_id] = {
            cost_score: row.cost_score ?? null,
            time_score: row.time_score ?? null,
            feasibility_score: row.feasibility_score ?? null,
            maintenance_score: row.maintenance_score ?? null,
            market_fit_score: row.market_fit_score ?? null,
            estimated_cost: row.estimated_cost ?? null,
            estimated_months: row.estimated_months ?? null,
            risk_level: row.risk_level ?? null,
            total_score: row.total_score ?? null,
            platform_id: row.platform_id,
          };
        });
        setAnalyses(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!isMounted) return;
        setPaLoading(false);
      }
    };
    loadPlatformsAndAnalyses();
    return () => {
      isMounted = false;
    };
  }, [params?.id]);

  const updateAnalysisField = (platformId: string, field: keyof PlatformAnalysisPayload, value: any) => {
    setAnalyses(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        platform_id: platformId,
        [field]: value,
      },
    }));
  };

  const handleSavePlatform = async (platformId: string) => {
    if (!params?.id) return;
    try {
      setPaSavingId(platformId);
      const payload = analyses[platformId] || { platform_id: platformId };
      await upsertPlatformAnalysis(params.id, payload);
    } catch (e) {
      console.error(e);
    } finally {
      setPaSavingId(null);
    }
  };

  const handleSaveRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.id) return;
    try {
      setReqSaving(true);
      setSaveMessage(null);
      await upsertRequirements(params.id, requirements);
      setSaveMessage("Đã lưu yêu cầu dự án thành công.");
    } catch (e: any) {
      console.error(e);
      setSaveMessage(e?.message || "Lưu yêu cầu dự án thất bại");
    } finally {
      setReqSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      {/* Header */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50" />
        <div className="relative max-w-5xl mx-auto">
          <button
            onClick={() => router.push("/sessions")}
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại danh sách</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Chi tiết phiên phân tích
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Xem thông tin dự án và mô tả cho phiên phân tích DSS
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-xl">
              {error}
            </div>
          ) : !session ? (
            <div className="text-gray-400">Không tìm thấy session.</div>
          ) : (
            <div className="space-y-6">
              {/* Overview Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-3 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {session.project_name || "Untitled Project"}
                      </h2>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {session.created_at
                            ? new Date(session.created_at).toLocaleString("vi-VN")
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  {session.status && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                      {session.status}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {session.description || "Không có mô tả"}
                </p>
              </div>

              {/* Project Requirements Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleSaveRequirements} className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
                  <h3 className="text-xl font-semibold text-white">Yêu cầu dự án</h3>
                  {reqLoading && (
                    <div className="text-gray-400 text-sm">Đang tải yêu cầu dự án...</div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Khoảng ngân sách</label>
                      <select
                        value={requirements.budget_range ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, budget_range: (e.target.value || undefined) as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="<200M">&lt;200M</option>
                        <option value="200-500M">200-500M</option>
                        <option value=">500M">&gt;500M</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ngân sách (VND)</label>
                      <input type="number" value={requirements.budget_amount ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, budget_amount: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Thời gian (tháng)</label>
                      <input type="number" min={1} value={requirements.timeline_months ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, timeline_months: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Độ ưu tiên timeline</label>
                      <select
                        value={requirements.timeline_priority ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, timeline_priority: (e.target.value || null) as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="flexible">Flexible</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nền tảng mục tiêu</label>
                      <select
                        value={requirements.target_platform ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, target_platform: (e.target.value || null) as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="android_priority">Android ưu tiên</option>
                        <option value="ios_priority">iOS ưu tiên</option>
                        <option value="both_equal">Cả hai như nhau</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Thị trường mục tiêu</label>
                      <select
                        value={requirements.target_market ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, target_market: (e.target.value || null) as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="vietnam">Việt Nam</option>
                        <option value="asia">Châu Á</option>
                        <option value="global">Toàn cầu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Người dùng kỳ vọng</label>
                      <input type="number" min={0} value={requirements.expected_users ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, expected_users: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tổng số dev</label>
                      <input type="number" min={0} value={requirements.total_developers ?? ''}
                        onChange={(e) => setRequirements(r => ({ ...r, total_developers: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Android dev</label>
                      <input type="number" min={0} value={requirements.android_developers ?? 0}
                        onChange={(e) => setRequirements(r => ({ ...r, android_developers: Number(e.target.value || 0) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">iOS dev</label>
                      <input type="number" min={0} value={requirements.ios_developers ?? 0}
                        onChange={(e) => setRequirements(r => ({ ...r, ios_developers: Number(e.target.value || 0) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Flutter dev</label>
                      <input type="number" min={0} value={requirements.flutter_developers ?? 0}
                        onChange={(e) => setRequirements(r => ({ ...r, flutter_developers: Number(e.target.value || 0) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">React Native dev</label>
                      <input type="number" min={0} value={requirements.react_native_developers ?? 0}
                        onChange={(e) => setRequirements(r => ({ ...r, react_native_developers: Number(e.target.value || 0) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ưu tiên chi phí (1-5)</label>
                      <input type="number" min={1} max={5} value={requirements.cost_priority ?? 3}
                        onChange={(e) => setRequirements(r => ({ ...r, cost_priority: Number(e.target.value || 3) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ưu tiên tốc độ (1-5)</label>
                      <input type="number" min={1} max={5} value={requirements.speed_priority ?? 3}
                        onChange={(e) => setRequirements(r => ({ ...r, speed_priority: Number(e.target.value || 3) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ưu tiên chất lượng (1-5)</label>
                      <input type="number" min={1} max={5} value={requirements.quality_priority ?? 3}
                        onChange={(e) => setRequirements(r => ({ ...r, quality_priority: Number(e.target.value || 3) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ưu tiên bảo trì (1-5)</label>
                      <input type="number" min={1} max={5} value={requirements.maintenance_priority ?? 3}
                        onChange={(e) => setRequirements(r => ({ ...r, maintenance_priority: Number(e.target.value || 3) }))}
                        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white" />
                    </div>
                  </div>

                  {saveMessage && (
                    <div className="text-sm text-gray-300">{saveMessage}</div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={reqSaving}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-600 disabled:opacity-60"
                    >
                      {reqSaving ? 'Đang lưu...' : 'Lưu yêu cầu'}
                    </button>
                  </div>
                </form>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-3">Phân tích nền tảng</h3>
                  {paLoading ? (
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
                                onClick={() => handleSavePlatform(pf.id)}
                                disabled={paSavingId === pf.id}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60"
                              >
                                {paSavingId === pf.id ? 'Đang lưu...' : 'Lưu phân tích'}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Cost score (0-100)</label>
                                <input type="number" min={0} max={100} value={a.cost_score ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'cost_score', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Time score (0-100)</label>
                                <input type="number" min={0} max={100} value={a.time_score ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'time_score', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Feasibility (0-100)</label>
                                <input type="number" min={0} max={100} value={a.feasibility_score ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'feasibility_score', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Maintenance (0-100)</label>
                                <input type="number" min={0} max={100} value={a.maintenance_score ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'maintenance_score', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Market fit (0-100)</label>
                                <input type="number" min={0} max={100} value={a.market_fit_score ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'market_fit_score', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Ước tính chi phí</label>
                                <input type="number" min={0} value={a.estimated_cost ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'estimated_cost', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Ước tính thời gian (tháng)</label>
                                <input type="number" min={0} step={0.1} value={a.estimated_months ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'estimated_months', e.target.value===''? null : Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Rủi ro</label>
                                <select value={a.risk_level ?? ''}
                                  onChange={(e)=>updateAnalysisField(pf.id,'risk_level', (e.target.value||null) as any)}
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
                                  onChange={(e)=>updateAnalysisField(pf.id,'total_score', e.target.value===''? null : Number(e.target.value))}
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
          )}
        </div>
      </div>
    </div>
  );
}
