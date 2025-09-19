"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Session } from "@/types/sessions";

// Components con
import SessionOverview from "@/components/sessions/SessionOverview";
import RequirementsForm from "@/components/sessions/RequirementsForm";
import PlatformsAnalysis from "@/components/sessions/PlatformsAnalysis";
import AHPLevel1 from "@/components/sessions/AHPLevel1";
import AHPLevel2 from "@/components/sessions/AHPLevel2";
import AHPAltComparison from "@/components/sessions/AHPAltComparison";
import AHPResultsModal from "@/components/sessions/AHPResultsModal";

// Services
import { getSessionById } from "@/services/sessionService";
import {
  getRequirements,
  upsertRequirements,
  type ProjectRequirementsPayload,
} from "@/services/requirementsService";
import {
  getPlatforms,
  type Platform,
} from "@/services/platformsService";
import {
  getPlatformAnalyses,
  upsertPlatformAnalysis,
  type PlatformAnalysisPayload,
} from "@/services/platformAnalysisService";
import {
  getCriteria,
  getPairwise,
  upsertPairwise,
  getAltPairwise,
  upsertAltPairwise,
  calculateAhp,
  upsertRecommendation,
  type AhpCriterion,
} from "@/services/ahpService";

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // Session
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Requirements
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
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSaving, setReqSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Platforms
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, PlatformAnalysisPayload>>({});
  const [paLoading, setPaLoading] = useState(false);
  const [paSavingId, setPaSavingId] = useState<string | null>(null);

  // AHP Level 1
  const [criteriaL1, setCriteriaL1] = useState<AhpCriterion[]>([]);
  const [pairwiseL1, setPairwiseL1] = useState<Record<string, number>>({});
  const [ahpLoading, setAhpLoading] = useState(false);
  const [ahpSaving, setAhpSaving] = useState(false);

  // AHP Level 2
  const [criteriaL2, setCriteriaL2] = useState<AhpCriterion[]>([]);
  const [pairwiseL2, setPairwiseL2] = useState<Record<string, number>>({});
  const [selectedParentL2, setSelectedParentL2] = useState("");
  const [ahpL2Loading, setAhpL2Loading] = useState(false);
  const [ahpL2Saving, setAhpL2Saving] = useState(false);

  // Alternatives
  const [criteriaAllL2, setCriteriaAllL2] = useState<AhpCriterion[]>([]);
  const [altSelectedCriteria, setAltSelectedCriteria] = useState("");
  const [altPairwise, setAltPairwise] = useState<Record<string, number>>({});
  const [altLoading, setAltLoading] = useState(false);
  const [altSaving, setAltSaving] = useState(false);

  // AHP Results
  const [openResults, setOpenResults] = useState(false);
  const [ahpResult, setAhpResult] = useState<any | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Recommendation
  const [recRationale, setRecRationale] = useState("");
  const [recSaving, setRecSaving] = useState(false);
  const [recMsg, setRecMsg] = useState<string | null>(null);

  // ===== Load session =====
  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      try {
        setLoading(true);
        const data = await getSessionById(params.id);
        setSession(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params?.id]);

  // ===== Load requirements =====
  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setReqLoading(true);
      const data = await getRequirements(params.id);
      if (data) setRequirements({ ...requirements, ...data });
      setReqLoading(false);
    })();
  }, [params?.id]);

  // ===== Load platforms =====
  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setPaLoading(true);
      const [pf, pa] = await Promise.all([
        getPlatforms(),
        getPlatformAnalyses(params.id),
      ]);
      setPlatforms(pf || []);
      const map: Record<string, PlatformAnalysisPayload> = {};
      (pa || []).forEach((row: any) => (map[row.platform_id] = row));
      setAnalyses(map);
      setPaLoading(false);
    })();
  }, [params?.id]);

  // ===== Load AHP level 1 =====
  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      setAhpLoading(true);
      const [criteria, pairs] = await Promise.all([
        getCriteria(1),
        getPairwise(params.id, 1),
      ]);
      setCriteriaL1(criteria || []);
      const map: Record<string, number> = {};
      (pairs || []).forEach((p: any) => {
        const i = p.criteria_i_id as string;
        const j = p.criteria_j_id as string;
        map[`${i}|${j}`] = Number(p.comparison_value);
      });
      setPairwiseL1(map);
      setAhpLoading(false);
    })();
  }, [params?.id]);

  // ===== Load all level 2 criteria (for alternatives) =====
  useEffect(() => {
    (async () => {
      const list = await getCriteria(2);
      setCriteriaAllL2(list || []);
    })();
  }, []);

  // ===== Handlers =====
  const handleSaveRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.id) return;
    setReqSaving(true);
    await upsertRequirements(params.id, requirements);
    setSaveMessage("Đã lưu yêu cầu dự án thành công.");
    setReqSaving(false);
  };

  const handleSavePlatform = async (platformId: string) => {
    if (!params?.id) return;
    setPaSavingId(platformId);
    await upsertPlatformAnalysis(params.id, analyses[platformId]);
    setPaSavingId(null);
  };

  const handleSavePairwiseL1 = async () => {
    if (!params?.id) return;
    setAhpSaving(true);
    const items = Object.entries(pairwiseL1).map(([key, val]) => {
      const [iId, jId] = key.split("|");
      return {
        criteria_level: 1,
        parent_criteria_id: null,
        criteria_i_id: iId,
        criteria_j_id: jId,
        comparison_value: val,
      };
    });
    await upsertPairwise(params.id, items);
    setAhpSaving(false);
  };

  const handleSavePairwiseL2 = async () => {
    if (!params?.id || !selectedParentL2) return;
    setAhpL2Saving(true);
    const items = Object.entries(pairwiseL2).map(([key, val]) => {
      const [iId, jId] = key.split("|");
      return {
        criteria_level: 2,
        parent_criteria_id: selectedParentL2,
        criteria_i_id: iId,
        criteria_j_id: jId,
        comparison_value: val,
      };
    });
    await upsertPairwise(params.id, items);
    setAhpL2Saving(false);
  };

  const handleSaveAltPairs = async () => {
    if (!params?.id || !altSelectedCriteria) return;
    setAltSaving(true);
    const items = Object.entries(altPairwise).map(([key, val]) => {
      const [iId, jId] = key.split("|");
      return {
        criteria_id: altSelectedCriteria,
        alternative_i_id: iId,
        alternative_j_id: jId,
        comparison_value: val,
      };
    });
    await upsertAltPairwise(params.id, items);
    setAltSaving(false);
  };

  const handleCalculateAhp = async () => {
    if (!params?.id) return;
    setCalcLoading(true);
    const res = await calculateAhp(params.id);
    setAhpResult(res);
    setCalcLoading(false);
  };

  const handleSaveRecommendation = async () => {
    if (!params?.id || !ahpResult) return;
    setRecSaving(true);
    await upsertRecommendation(params.id, {
      recommended_platform_id: Object.keys(ahpResult.final_scores)[0],
      confidence: 1,
      rationale: recRationale,
    });
    setRecMsg("Đã lưu khuyến nghị");
    setRecSaving(false);
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/sessions")}
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="text-gray-400">Đang tải...</div>
        ) : session ? (
          <>
            <SessionOverview session={session} />

            <RequirementsForm
              requirements={requirements}
              setRequirements={setRequirements}
              reqSaving={reqSaving}
              reqLoading={reqLoading}
              saveMessage={saveMessage}
              onSave={handleSaveRequirements}
            />

            <PlatformsAnalysis
              platforms={platforms}
              analyses={analyses}
              paLoading={paLoading}
              paSavingId={paSavingId}
              updateAnalysisField={(id, f, v) =>
                setAnalyses((prev) => ({
                  ...prev,
                  [id]: { ...prev[id], [f]: v },
                }))
              }
              suggestFromAHP={() => {}}
              suggestFromRequirements={() => {}}
              handleSavePlatform={handleSavePlatform}
            />

            <AHPLevel1
              criteria={criteriaL1}
              pairwise={pairwiseL1}
              loading={ahpLoading}
              saving={ahpSaving}
              onSetPair={(i, j, v) =>
                setPairwiseL1((prev) => ({ ...prev, [`${i}|${j}`]: v }))
              }
              onSave={handleSavePairwiseL1}
            />

            <AHPLevel2
              parentCriteria={criteriaL1}
              criteria={criteriaL2}
              pairwise={pairwiseL2}
              selectedParent={selectedParentL2}
              loading={ahpL2Loading}
              saving={ahpL2Saving}
              onSelectParent={setSelectedParentL2}
              onSetPair={(i, j, v) =>
                setPairwiseL2((prev) => ({ ...prev, [`${i}|${j}`]: v }))
              }
              onSave={handleSavePairwiseL2}
            />

            <AHPAltComparison
              platforms={platforms}
              criteria={criteriaAllL2}
              selectedCriteria={altSelectedCriteria}
              pairwise={altPairwise}
              loading={altLoading}
              saving={altSaving}
              onSelectCriteria={setAltSelectedCriteria}
              onSetPair={(i, j, v) =>
                setAltPairwise((prev) => ({ ...prev, [`${i}|${j}`]: v }))
              }
              onSave={handleSaveAltPairs}
            />

            <button
              onClick={() => setOpenResults(true)}
              className="bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg"
            >
              Xem kết quả AHP
            </button>

            <AHPResultsModal
              open={openResults}
              onClose={() => setOpenResults(false)}
              ahpResult={ahpResult}
              platforms={platforms}
              recRationale={recRationale}
              recSaving={recSaving}
              recMsg={recMsg}
              calcLoading={calcLoading}
              onSetRecRationale={setRecRationale}
              onSaveRecommendation={handleSaveRecommendation}
              onCalculate={handleCalculateAhp}
            />
          </>
        ) : (
          <div className="text-gray-400">Không tìm thấy session.</div>
        )}
      </div>
    </div>
  );
}
