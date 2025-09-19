"use client";
import { Platform } from "@/services/platformsService";
import { PlatformAnalysisPayload } from "@/services/platformAnalysisService";

interface Props {
  platforms: Platform[];
  analyses: Record<string, PlatformAnalysisPayload>;
  paLoading: boolean;
  paSavingId: string | null;
  updateAnalysisField: (
    platformId: string,
    field: keyof PlatformAnalysisPayload,
    value: any
  ) => void;
  suggestFromAHP: (id: string) => void;
  suggestFromRequirements: (id: string) => void;
  handleSavePlatform: (id: string) => void;
}

export default function PlatformsAnalysis({
  platforms,
  analyses,
  paLoading,
  paSavingId,
  updateAnalysisField,
  suggestFromAHP,
  suggestFromRequirements,
  handleSavePlatform,
}: Props) {
  return (
    <div
      id="platforms"
      className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700"
    >
      <h3 className="text-xl font-semibold text-white mb-3">
        Phân tích nền tảng
      </h3>
      {paLoading ? (
        <div className="text-gray-400 text-sm">Đang tải danh sách nền tảng...</div>
      ) : platforms.length === 0 ? (
        <div className="text-gray-400 text-sm">Chưa có nền tảng nào khả dụng.</div>
      ) : (
        <div className="space-y-6">
          {platforms.map((pf) => {
            const a =
              analyses[pf.id] || ({ platform_id: pf.id } as PlatformAnalysisPayload);
            return (
              <div
                key={pf.id}
                className="border border-gray-700 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{pf.name}</div>
                    <div className="text-xs text-gray-400">{pf.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => suggestFromAHP(pf.id)}
                      className="px-3 py-2 rounded-lg border border-blue-700 bg-blue-600/20 text-blue-300 text-xs"
                    >
                      Gợi ý từ AHP
                    </button>
                    <button
                      type="button"
                      onClick={() => suggestFromRequirements(pf.id)}
                      className="px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-600/20 text-emerald-300 text-xs"
                    >
                      Tính từ yêu cầu
                    </button>
                    <button
                      onClick={() => handleSavePlatform(pf.id)}
                      disabled={paSavingId === pf.id}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60"
                    >
                      {paSavingId === pf.id ? "Đang lưu..." : "Lưu phân tích"}
                    </button>
                  </div>
                </div>

                {/* Ví dụ 1 input (cost_score), copy thêm các input khác */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Cost score (0-100)
                  </label>
                  <input
                    type="number"
                    value={a.cost_score ?? ""}
                    onChange={(e) =>
                      updateAnalysisField(
                        pf.id,
                        "cost_score",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
