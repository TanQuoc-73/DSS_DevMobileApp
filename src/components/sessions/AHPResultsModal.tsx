"use client";

import Modal from "@/components/ui/Modal";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Platform } from "@/services/platformsService";

interface Props {
  open: boolean;
  onClose: () => void;
  ahpResult: any | null;
  platforms: Platform[];
  recRationale: string;
  recSaving: boolean;
  recMsg: string | null;
  calcLoading: boolean;
  onSetRecRationale: (val: string) => void;
  onSaveRecommendation: () => void;
  onCalculate: () => void;
}

export default function AHPResultsModal({
  open,
  onClose,
  ahpResult,
  platforms,
  recRationale,
  recSaving,
  recMsg,
  calcLoading,
  onSetRecRationale,
  onSaveRecommendation,
  onCalculate,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kết quả AHP"
      size="xl"
      footer={
        <>
          {recMsg && (
            <span className="text-gray-300 text-sm mr-auto">{recMsg}</span>
          )}
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm"
          >
            Đóng
          </button>
          <button
            onClick={onCalculate}
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
          {/* Ranking */}
          <div>
            <h4 className="text-white font-semibold mb-2">Xếp hạng nền tảng</h4>
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
                    <tr
                      key={altId}
                      className="border-t border-gray-800 text-gray-300"
                    >
                      <td className="py-2 pr-4">{idx + 1}</td>
                      <td className="py-2 pr-4">
                        {platforms.find((p) => p.id === altId)?.name || altId}
                      </td>
                      <td className="py-2 pr-4">{Number(score).toFixed(4)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div>
            <h4 className="text-white font-semibold mb-2">Biểu đồ xếp hạng</h4>
            <div className="w-full h-64 bg-gray-900/40 rounded-xl border border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(ahpResult.final_scores || {})
                    .map(([altId, score]: any) => ({
                      name: platforms.find((p) => p.id === altId)?.name || altId,
                      score: Number(score),
                    }))
                    .sort((a, b) => b.score - a.score)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      color: "#E5E7EB",
                    }}
                  />
                  <Bar dataKey="score" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <h4 className="text-white font-semibold mb-2">Khuyến nghị</h4>
            <textarea
              value={recRationale}
              onChange={(e) => onSetRecRationale(e.target.value)}
              placeholder="Lý do/ghi chú cho khuyến nghị..."
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={onSaveRecommendation}
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
  );
}
