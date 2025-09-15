"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { getSessionById } from "@/services/sessionService";
import { getRequirements, upsertRequirements, type ProjectRequirementsPayload } from "@/services/requirementsService";
import { getPlatforms, type Platform } from "@/services/platformsService";
import { getPlatformAnalyses, upsertPlatformAnalysis, type PlatformAnalysisPayload } from "@/services/platformAnalysisService";
import { getCriteria, getPairwise, upsertPairwise, getAltPairwise, upsertAltPairwise, calculateAhp, upsertRecommendation, type AhpCriterion } from "@/services/ahpService";

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
  // AHP level-1 states
  const [criteriaL1, setCriteriaL1] = useState<AhpCriterion[]>([]);
  const [pairwiseL1, setPairwiseL1] = useState<Record<string, number>>({}); // key: iId|jId (i<j)
  const [ahpLoading, setAhpLoading] = useState(false);
  const [ahpSaving, setAhpSaving] = useState(false);
  // AHP level-2 states
  const [selectedParentL2, setSelectedParentL2] = useState<string | ''>('');
  const [criteriaL2, setCriteriaL2] = useState<AhpCriterion[]>([]);
  const [pairwiseL2, setPairwiseL2] = useState<Record<string, number>>({}); // key i|j where i<j
  const [ahpL2Loading, setAhpL2Loading] = useState(false);
  const [ahpL2Saving, setAhpL2Saving] = useState(false);
  // Alternatives vs Criteria
  const [criteriaAllL2, setCriteriaAllL2] = useState<AhpCriterion[]>([]);
  const [altSelectedCriteria, setAltSelectedCriteria] = useState<string | ''>('');
  const [altPairwise, setAltPairwise] = useState<Record<string, number>>({}); // key altI|altJ where i<j
  const [altLoading, setAltLoading] = useState(false);
  const [altSaving, setAltSaving] = useState(false);
  // AHP results
  const [calcLoading, setCalcLoading] = useState(false);
  const [ahpResult, setAhpResult] = useState<any | null>(null);
  // Inline messages for saves
  const [ahpL1Msg, setAhpL1Msg] = useState<string | null>(null);
  const [ahpL2Msg, setAhpL2Msg] = useState<string | null>(null);
  const [altMsg, setAltMsg] = useState<string | null>(null);
  // Top tabs (scroll to sections)
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'platforms' | 'ahp' | 'results'>('overview');
  // Modals
  const [openL1, setOpenL1] = useState(false);
  const [openL2, setOpenL2] = useState(false);
  const [openAlt, setOpenAlt] = useState(false);
  const [openResults, setOpenResults] = useState(false);
  // Recommendation
  const [recRationale, setRecRationale] = useState<string>("");
  const [recSaving, setRecSaving] = useState(false);
  const [recMsg, setRecMsg] = useState<string | null>(null);
  const jumpTo = (id: string) => {
    setActiveTab(id as any);
    if (typeof window !== 'undefined') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  // Load all level-2 criteria once for Alternatives vs Criteria selector
  useEffect(() => {
    let isMounted = true;
    const loadAllL2 = async () => {
      try {
        const list = await getCriteria(2);
        if (!isMounted) return;
        setCriteriaAllL2(list || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadAllL2();
    return () => { isMounted = false; };
  }, []);

  // Load alternative pairwise when criteria selected
  useEffect(() => {
    let isMounted = true;
    const loadAltPairs = async () => {
      if (!params?.id || !altSelectedCriteria) {
        setAltPairwise({});
        return;
      }
      try {
        setAltLoading(true);
        const rows = await getAltPairwise(params.id, altSelectedCriteria);
        if (!isMounted) return;
        const map: Record<string, number> = {};
        (rows || []).forEach((r: any) => {
          const i = r.alternative_i_id as string;
          const j = r.alternative_j_id as string;
          const key = i < j ? `${i}|${j}` : `${j}|${i}`;
          map[key] = Number(r.comparison_value);
        });
        setAltPairwise(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!isMounted) return;
        setAltLoading(false);
      }
    };
    loadAltPairs();
    return () => { isMounted = false; };
  }, [params?.id, altSelectedCriteria]);

  const handleSetAltPair = (iId: string, jId: string, val: number) => {
    const key = iId < jId ? `${iId}|${jId}` : `${jId}|${iId}`;
    setAltPairwise(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveAltPairs = async () => {
    if (!params?.id || !altSelectedCriteria || platforms.length < 2) return;
    try {
      setAltSaving(true);
      const items: any[] = [];
      for (let a = 0; a < platforms.length; a++) {
        for (let b = a + 1; b < platforms.length; b++) {
          const iId = platforms[a].id;
          const jId = platforms[b].id;
          const key = `${iId}|${jId}`;
          const v = (altPairwise[key] ?? 1);
          items.push({
            criteria_id: altSelectedCriteria,
            alternative_i_id: iId,
            alternative_j_id: jId,
            comparison_value: v,
          });
        }
      }
      await upsertAltPairwise(params.id, items);
      setAltMsg("Đã lưu so sánh nền tảng theo tiêu chí");
      setTimeout(() => setAltMsg(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setAltSaving(false);
    }
  };

  const handleCalculateAhp = async () => {
    if (!params?.id) return;
    try {
      setCalcLoading(true);
      const res = await calculateAhp(params.id);
      setAhpResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSaveRecommendation = async () => {
    if (!params?.id || !ahpResult || !ahpResult.final_scores) return;
    try {
      setRecSaving(true);
      setRecMsg(null);
      const entries = Object.entries(ahpResult.final_scores as Record<string, number>);
      if (!entries.length) return;
      const total = entries.reduce((s, [, v]) => s + Number(v || 0), 0) || 1;
      const [bestId, bestScore] = entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
      const confidence = Math.max(0, Math.min(1, Number(bestScore) / total));
      await upsertRecommendation(params.id, {
        recommended_platform_id: bestId,
        confidence,
        rationale: recRationale || null,
      });
      setRecMsg("Đã lưu khuyến nghị");
      setTimeout(() => setRecMsg(null), 2500);
    } catch (e: any) {
      console.error(e);
      setRecMsg(e?.message || "Lưu khuyến nghị thất bại");
    } finally {
      setRecSaving(false);
    }
  };

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

  // Load AHP level-1 criteria and pairwise
  useEffect(() => {
    let isMounted = true;
    const loadAHP = async () => {
      if (!params?.id) return;
      try {
        setAhpLoading(true);
        const [criteria, pairs] = await Promise.all([
          getCriteria(1),
          getPairwise(params.id, 1),
        ]);
        if (!isMounted) return;
        setCriteriaL1(criteria || []);
        const map: Record<string, number> = {};
        (pairs || []).forEach((p: any) => {
          const i = p.criteria_i_id as string;
          const j = p.criteria_j_id as string;
          const key = i < j ? `${i}|${j}` : `${j}|${i}`;
          // if it's j,i the reciprocal will be stored when rendering
          map[key] = Number(p.comparison_value);
        });
        setPairwiseL1(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!isMounted) return;
        setAhpLoading(false);
      }
    };
    loadAHP();
    return () => {
      isMounted = false;
    };
  }, [params?.id]);

  const handleSetPairL1 = (iId: string, jId: string, val: number) => {
    const key = iId < jId ? `${iId}|${jId}` : `${jId}|${iId}`;
    setPairwiseL1(prev => ({ ...prev, [key]: val }));
  };

  const handleSavePairwiseL1 = async () => {
    if (!params?.id || criteriaL1.length < 2) return;
    try {
      setAhpSaving(true);
      const items: any[] = [];
      // Build all pairs i<j from current map
      for (let a = 0; a < criteriaL1.length; a++) {
        for (let b = a + 1; b < criteriaL1.length; b++) {
          const iId = criteriaL1[a].id;
          const jId = criteriaL1[b].id;
          const key = `${iId}|${jId}`;
          const v = (pairwiseL1[key] ?? 1);
          items.push({
            criteria_level: 1,
            parent_criteria_id: null,
            criteria_i_id: iId,
            criteria_j_id: jId,
            comparison_value: v,
          });
        }
      }
      await upsertPairwise(params.id, items);
      setAhpL1Msg("Đã lưu so sánh Level 1");
      setTimeout(() => setAhpL1Msg(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setAhpSaving(false);
    }
  };

  // Load AHP Level 2 when parent selected
  useEffect(() => {
    let isMounted = true;
    const loadL2 = async () => {
      if (!params?.id || !selectedParentL2) {
        setCriteriaL2([]);
        setPairwiseL2({});
        return;
      }
      try {
        setAhpL2Loading(true);
        const [children, pairs] = await Promise.all([
          getCriteria(2, selectedParentL2),
          getPairwise(params.id, 2, selectedParentL2),
        ]);
        if (!isMounted) return;
        setCriteriaL2(children || []);
        const map: Record<string, number> = {};
        (pairs || []).forEach((p: any) => {
          const i = p.criteria_i_id as string;
          const j = p.criteria_j_id as string;
          const key = i < j ? `${i}|${j}` : `${j}|${i}`;
          map[key] = Number(p.comparison_value);
        });
        setPairwiseL2(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!isMounted) return;
        setAhpL2Loading(false);
      }
    };
    loadL2();
    return () => { isMounted = false; };
  }, [params?.id, selectedParentL2]);

  const handleSetPairL2 = (iId: string, jId: string, val: number) => {
    const key = iId < jId ? `${iId}|${jId}` : `${jId}|${iId}`;
    setPairwiseL2(prev => ({ ...prev, [key]: val }));
  };

  const handleSavePairwiseL2 = async () => {
    if (!params?.id || !selectedParentL2 || criteriaL2.length < 2) return;
    try {
      setAhpL2Saving(true);
      const items: any[] = [];
      for (let a = 0; a < criteriaL2.length; a++) {
        for (let b = a + 1; b < criteriaL2.length; b++) {
          const iId = criteriaL2[a].id;
          const jId = criteriaL2[b].id;
          const key = `${iId}|${jId}`;
          const v = (pairwiseL2[key] ?? 1);
          items.push({
            criteria_level: 2,
            parent_criteria_id: selectedParentL2,
            criteria_i_id: iId,
            criteria_j_id: jId,
            comparison_value: v,
          });
        }
      }
      await upsertPairwise(params.id, items);
      setAhpL2Msg("Đã lưu so sánh Level 2");
      setTimeout(() => setAhpL2Msg(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setAhpL2Saving(false);
    }
  };

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

  // Suggest analysis values from AHP results (non-destructive: only fill if empty)
  const suggestFromAHP = (platformId: string) => {
    if (!ahpResult?.final_scores) return;
    const raw = Number((ahpResult.final_scores as Record<string, number>)[platformId] || 0);
    const scaled = Math.max(0, Math.min(100, Math.round(raw * 100)));
    setAnalyses(prev => {
      const cur = prev[platformId] || { platform_id: platformId } as PlatformAnalysisPayload;
      return {
        ...prev,
        [platformId]: {
          ...cur,
          total_score: cur.total_score ?? scaled,
          time_score: cur.time_score ?? scaled,
          feasibility_score: cur.feasibility_score ?? Math.max(50, Math.min(100, scaled)),
          maintenance_score: cur.maintenance_score ?? Math.max(50, Math.min(100, scaled)),
          market_fit_score: cur.market_fit_score ?? Math.max(50, Math.min(100, scaled)),
          cost_score: cur.cost_score ?? scaled,
        },
      };
    });
  };

  // Suggest analysis values from project requirements (non-destructive where possible)
  const suggestFromRequirements = (platformId: string) => {
    const r = requirements;
    const cur = analyses[platformId] || { platform_id: platformId } as PlatformAnalysisPayload;

    const months = r.timeline_months ?? 6; // default 6 months
    const time_score = Math.max(0, Math.min(100, 110 - months * 10));

    let estimated_cost: number | null = cur.estimated_cost ?? null;
    let cost_score = cur.cost_score ?? null;
    if (r.budget_range === '<200M') {
      estimated_cost = estimated_cost ?? 150;
      cost_score = cost_score ?? 85;
    } else if (r.budget_range === '200-500M') {
      estimated_cost = estimated_cost ?? 300;
      cost_score = cost_score ?? 60;
    } else if (r.budget_range === '>500M') {
      estimated_cost = estimated_cost ?? 600;
      cost_score = cost_score ?? 40;
    }

    const totalDevs = r.total_developers ?? 2;
    const feasibility_score = cur.feasibility_score ?? (totalDevs >= 3 ? 80 : 60);
    const maintenance_score = cur.maintenance_score ?? 70;

    let market_fit_score = cur.market_fit_score ?? null;
    if (market_fit_score == null) {
      if (r.target_market === 'global') market_fit_score = 80;
      else if (r.target_market === 'asia') market_fit_score = 70;
      else if (r.target_market === 'vietnam') market_fit_score = 60;
      else market_fit_score = 65;
    }

    let risk_level = cur.risk_level ?? null;
    if (risk_level == null) {
      risk_level = totalDevs < 2 ? 'high' : totalDevs < 4 ? 'medium' : 'low';
    }

    setAnalyses(prev => ({
      ...prev,
      [platformId]: {
        ...cur,
        platform_id: platformId,
        time_score: cur.time_score ?? time_score,
        cost_score: cost_score ?? cur.cost_score ?? undefined,
        feasibility_score,
        maintenance_score,
        market_fit_score,
        estimated_cost: estimated_cost ?? cur.estimated_cost ?? undefined,
        estimated_months: cur.estimated_months ?? months,
        risk_level,
        total_score: cur.total_score ?? Math.round(((cost_score ?? 0) + time_score + feasibility_score + maintenance_score + (market_fit_score ?? 0)) / 5),
      },
    }));
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
          {/* AHP - Công cụ (mở modal) */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-2xl border border-gray-700 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">AHP - Công cụ</h3>
              <div className="flex gap-2">
                <button onClick={()=>setOpenL1(true)} className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm hover:border-gray-500">So sánh Level 1</button>
                <button onClick={()=>setOpenL2(true)} className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm hover:border-gray-500">So sánh Level 2</button>
                <button onClick={()=>setOpenAlt(true)} className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm hover:border-gray-500">Alternatives theo tiêu chí</button>
                <button onClick={()=>setOpenResults(true)} className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm hover:border-gray-500">Kết quả AHP</button>
              </div>
            </div>
          </div>
          {/* Tabs Navigation */}
          <div className="sticky top-0 z-10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'requirements', label: 'Yêu cầu' },
                { id: 'platforms', label: 'Nền tảng' },
                { id: 'ahp', label: 'AHP' },
                { id: 'results', label: 'Kết quả' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => jumpTo(t.id)}
                  className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors ${
                    activeTab === (t.id as any)
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-transparent border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
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
              <div id="overview" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-3 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-white" />
                      </div>
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
                <p className="text-gray-300 leading-relaxed mt-3">
                  {session.description || "Không có mô tả"}
                </p>
              </div>

              {/* AHP: Kết quả tính toán và xếp hạng */}
              <div id="results" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Kết quả AHP</h3>
                  <div className="flex gap-2">
                    <button onClick={handleCalculateAhp} disabled={calcLoading}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60">
                      {calcLoading ? 'Đang tính...' : 'Tính toán AHP'}
                    </button>
                    <button onClick={()=>setOpenResults(true)}
                      className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm hover:border-gray-500">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="text-gray-400 text-sm mt-3">Mở modal để xem bảng xếp hạng, biểu đồ và CR chi tiết. {ahpResult ? '' : 'Chưa có kết quả lần nào.'}</div>
              </div>

              {/* AHP: Alternatives vs Criteria */}
              <details className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700" open>
                <summary className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-xl font-semibold text-white">AHP - So sánh nền tảng theo tiêu chí</span>
                  <span className="text-xs text-gray-400">Mở/đóng</span>
                </summary>
                <div className="mt-4 flex items-center justify-between gap-3 mb-4">
                  <select
                    value={altSelectedCriteria}
                    onChange={(e)=>setAltSelectedCriteria(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                  >
                    <option value="">-- Chọn tiêu chí (Level 2) --</option>
                    {criteriaAllL2.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                  <button onClick={handleSaveAltPairs} disabled={altSaving}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60">
                    {altSaving ? 'Đang lưu...' : 'Lưu so sánh'}
                  </button>
                </div>
                {!altSelectedCriteria ? (
                  <div className="text-gray-400 text-sm">Vui lòng chọn một tiêu chí Level 2 để so sánh các nền tảng.</div>
                ) : altLoading ? (
                  <div className="text-gray-400 text-sm">Đang tải cặp so sánh...</div>
                ) : platforms.length < 2 ? (
                  <div className="text-gray-400 text-sm">Chưa đủ nền tảng để so sánh.</div>
                ) : (
                  <div className="space-y-3">
                    {platforms.map((pi, idx) => (
                      <div key={pi.id} className="space-y-3">
                        {platforms.slice(idx + 1).map((pj) => {
                          const key = `${pi.id}|${pj.id}`;
                          const current = altPairwise[key] ?? 1;
                          return (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border border-gray-800 rounded-lg p-3">
                              <div className="text-gray-300 text-sm">{pi.name} so với {pj.name}</div>
                              <select value={current}
                                onChange={(e)=>handleSetAltPair(pi.id, pj.id, Number(e.target.value))}
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white">
                                <option value={0.111}>1/9 - Cực kém</option>
                                <option value={0.125}>1/8</option>
                                <option value={0.142}>1/7</option>
                                <option value={0.167}>1/6</option>
                                <option value={0.2}>1/5</option>
                                <option value={0.25}>1/4</option>
                                <option value={0.333}>1/3</option>
                                <option value={0.5}>1/2</option>
                                <option value={1}>1 - Bằng nhau</option>
                                <option value={2}>2 - Hơi hơn</option>
                                <option value={3}>3 - Hơn</option>
                                <option value={4}>4</option>
                                <option value={5}>5 - Mạnh</option>
                                <option value={6}>6</option>
                                <option value={7}>7 - Rất mạnh</option>
                                <option value={8}>8</option>
                                <option value={9}>9 - Cực mạnh</option>
                              </select>
                              <div className="text-xs text-gray-500">Chọn mức độ ưu tiên của "{pi.name}" so với "{pj.name}"</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </details>

              {/* AHP: So sánh cặp tiêu chí (Level 2 theo tiêu chí cha) */}
              <details className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                <summary className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-xl font-semibold text-white">AHP - So sánh cặp tiêu chí (Level 2)</span>
                  <span className="text-xs text-gray-400">Mở/đóng</span>
                </summary>
                <div className="mt-4 flex items-center justify-between gap-3 mb-4">
                  <select
                    value={selectedParentL2}
                    onChange={(e)=>setSelectedParentL2(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                  >
                    <option value="">-- Chọn tiêu chí cha --</option>
                    {criteriaL1.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                  <button onClick={handleSavePairwiseL2} disabled={ahpL2Saving}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60">
                    {ahpL2Saving ? 'Đang lưu...' : 'Lưu so sánh'}
                  </button>
                </div>
                {!selectedParentL2 ? (
                  <div className="text-gray-400 text-sm">Vui lòng chọn tiêu chí cha để so sánh các tiêu chí con.</div>
                ) : ahpL2Loading ? (
                  <div className="text-gray-400 text-sm">Đang tải tiêu chí con...</div>
                ) : criteriaL2.length < 2 ? (
                  <div className="text-gray-400 text-sm">Chưa đủ tiêu chí con để so sánh.</div>
                ) : (
                  <div className="space-y-3">
                    {criteriaL2.map((ci, idx) => (
                      <div key={ci.id} className="space-y-3">
                        {criteriaL2.slice(idx + 1).map((cj) => {
                          const key = `${ci.id}|${cj.id}`;
                          const current = pairwiseL2[key] ?? 1;
                          return (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border border-gray-800 rounded-lg p-3">
                              <div className="text-gray-300 text-sm">{ci.name} so với {cj.name}</div>
                              <select value={current}
                                onChange={(e)=>handleSetPairL2(ci.id, cj.id, Number(e.target.value))}
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white">
                                <option value={0.111}>1/9 - Cực kém</option>
                                <option value={0.125}>1/8</option>
                                <option value={0.142}>1/7</option>
                                <option value={0.167}>1/6</option>
                                <option value={0.2}>1/5</option>
                                <option value={0.25}>1/4</option>
                                <option value={0.333}>1/3</option>
                                <option value={0.5}>1/2</option>
                                <option value={1}>1 - Bằng nhau</option>
                                <option value={2}>2 - Hơi hơn</option>
                                <option value={3}>3 - Hơn</option>
                                <option value={4}>4</option>
                                <option value={5}>5 - Mạnh</option>
                                <option value={6}>6</option>
                                <option value={7}>7 - Rất mạnh</option>
                                <option value={8}>8</option>
                                <option value={9}>9 - Cực mạnh</option>
                              </select>
                              <div className="text-xs text-gray-500">Chọn mức độ ưu tiên của "{ci.name}" so với "{cj.name}"</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </details>
              {/* Project Requirements Form */}
              <div id="requirements" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <div id="platforms" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
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
                            <div className="flex items-center justify-between mb-3 gap-3">
                              <div>
                                <div className="font-semibold text-white">{pf.name}</div>
                                <div className="text-xs text-gray-400">{pf.type}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => suggestFromAHP(pf.id)}
                                  className="px-3 py-2 rounded-lg border border-blue-700 bg-blue-600/20 text-blue-300 text-xs hover:bg-blue-600/30"
                                >
                                  Gợi ý từ AHP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => suggestFromRequirements(pf.id)}
                                  className="px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-600/20 text-emerald-300 text-xs hover:bg-emerald-600/30"
                                >
                                  Tính từ yêu cầu
                                </button>
                                <button
                                  onClick={() => handleSavePlatform(pf.id)}
                                  disabled={paSavingId === pf.id}
                                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60"
                                >
                                  {paSavingId === pf.id ? 'Đang lưu...' : 'Lưu phân tích'}
                                </button>
                              </div>
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

              {/* AHP: So sánh cặp tiêu chí (Level 1) */}
              <details id="ahp" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700" open>
                <summary className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-xl font-semibold text-white">AHP - So sánh cặp tiêu chí (Level 1)</span>
                  <span className="text-xs text-gray-400">Mở/đóng</span>
                </summary>
                <div className="mt-4 flex items-center justify-end mb-4">
                  <button onClick={handleSavePairwiseL1} disabled={ahpSaving}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60">
                    {ahpSaving ? 'Đang lưu...' : 'Lưu so sánh'}
                  </button>
                </div>
                {ahpLoading ? (
                  <div className="text-gray-400 text-sm">Đang tải tiêu chí...</div>
                ) : criteriaL1.length < 2 ? (
                  <div className="text-gray-400 text-sm">Chưa đủ tiêu chí để so sánh.</div>
                ) : (
                  <div className="space-y-3">
                    {criteriaL1.map((ci, idx) => (
                      <div key={ci.id} className="space-y-3">
                        {criteriaL1.slice(idx + 1).map((cj) => {
                          const key = `${ci.id}|${cj.id}`;
                          const current = pairwiseL1[key] ?? 1;
                          return (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border border-gray-800 rounded-lg p-3">
                              <div className="text-gray-300 text-sm">{ci.name} so với {cj.name}</div>
                              <select value={current}
                                onChange={(e)=>handleSetPairL1(ci.id, cj.id, Number(e.target.value))}
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white">
                                {/* Saaty scale simplified including reciprocals */}
                                <option value={0.111}>1/9 - Cực kém</option>
                                <option value={0.125}>1/8</option>
                                <option value={0.142}>1/7</option>
                                <option value={0.167}>1/6</option>
                                <option value={0.2}>1/5</option>
                                <option value={0.25}>1/4</option>
                                <option value={0.333}>1/3</option>
                                <option value={0.5}>1/2</option>
                                <option value={1}>1 - Bằng nhau</option>
                                <option value={2}>2 - Hơi hơn</option>
                                <option value={3}>3 - Hơn</option>
                                <option value={4}>4</option>
                                <option value={5}>5 - Mạnh</option>
                                <option value={6}>6</option>
                                <option value={7}>7 - Rất mạnh</option>
                                <option value={8}>8</option>
                                <option value={9}>9 - Cực mạnh</option>
                              </select>
                              <div className="text-xs text-gray-500">Chọn mức độ ưu tiên của "{ci.name}" so với "{cj.name}"</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </details>
            </div>
          )}
          {/* Close wrappers: max-w-5xl and content padding container */}
        </div>
      </div>

      {/* Modal: AHP Results */}
        <Modal
          open={openResults}
          onClose={() => setOpenResults(false)}
          title="Kết quả AHP"
          size="xl"
          footer={
            <>
              {recMsg && (
                <span className="text-gray-300 text-sm mr-auto">{recMsg}</span>
              )}
              <button
                onClick={() => setOpenResults(false)}
                className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm"
              >
                Đóng
              </button>
              <button
                onClick={handleCalculateAhp}
                disabled={calcLoading}
                className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white text-sm disabled:opacity-60"
              >
                {calcLoading ? "Đang tính..." : "Tính toán AHP"}
              </button>
            </>
          }
        >
          {!ahpResult ? (
            <div className="text-gray-400 text-sm">
              Chưa có kết quả. Nhấn "Tính toán AHP" để tạo kết quả.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Xếp hạng nền tảng</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-300">
                        <th className="text-left py-2 pr-4">#</th>
                        <th className="text-left py-2 pr-4">Nền tảng</th>
                        <th className="text-left py-2 pr-4">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(ahpResult.final_scores as Record<string, number>)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .map(([altId, score], idx) => (
                          <tr key={altId} className="border-t border-gray-800 text-gray-300">
                            <td className="py-2 pr-4">{idx + 1}</td>
                            <td className="py-2 pr-4">{platforms.find((p) => p.id === altId)?.name || altId}</td>
                            <td className="py-2 pr-4">{Number(score).toFixed(4)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Biểu đồ xếp hạng nền tảng (Bar) */}
              <div>
                <h4 className="text-white font-semibold mb-2">Biểu đồ xếp hạng nền tảng</h4>
                <div className="w-full h-64 bg-gray-900/40 rounded-xl border border-gray-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart
                      data={Object.entries(ahpResult.final_scores || {})
                        .map(([altId, score]: any) => ({
                          name: platforms.find((p) => p.id === altId)?.name || altId,
                          score: Number(score),
                        }))
                        .sort((a, b) => b.score - a.score)}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#E5E7EB' }}
                      />
                      <Bar dataKey="score" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trọng số tiêu chí (Level 2) */}
              <div>
                <h4 className="text-white font-semibold mb-2">Trọng số tiêu chí (Level 2)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Danh sách trọng số (top 12) */}
                  <div className="space-y-2">
                    {Object.entries(ahpResult.criteria_weights as Record<string, number>)
                      .sort((a: any, b: any) => b[1] - a[1])
                      .slice(0, 12)
                      .map(([code, w]) => (
                        <div
                          key={code}
                          className="border border-gray-800 rounded-lg p-3 text-gray-300 flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">{code}</span>
                          <span className="text-xs text-gray-400">{Number(w).toFixed(4)}</span>
                        </div>
                      ))}
                  </div>
                  {/* Biểu đồ trọng số tiêu chí (Bar) */}
                  <div className="w-full h-64 bg-gray-900/40 rounded-xl border border-gray-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <RBarChart
                        data={Object.entries(ahpResult.criteria_weights || {})
                          .map(([code, w]: any) => ({ code, weight: Number(w) }))
                          .sort((a, b) => b.weight - a.weight)
                          .slice(0, 12)}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="code"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#E5E7EB' }}
                        />
                        <Bar dataKey="weight" fill="#34D399" radius={[6, 6, 0, 0]} />
                      </RBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Ghi chú/khuyến nghị tối giản (tùy chọn mở rộng sau) */}
              <div>
                <h4 className="text-white font-semibold mb-2">Khuyến nghị</h4>
                <textarea
                  value={recRationale}
                  onChange={(e) => setRecRationale(e.target.value)}
                  placeholder="Lý do/ghi chú cho khuyến nghị..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveRecommendation}
                    disabled={recSaving}
                    className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white text-sm disabled:opacity-60"
                  >
                    {recSaving ? "Đang lưu..." : "Lưu khuyến nghị"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      
      </div>
  );
}


