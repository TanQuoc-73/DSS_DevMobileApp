"use client";

import { AhpCriterion } from "@/services/ahpService";

interface Props {
  parentCriteria: AhpCriterion[];
  criteria: AhpCriterion[];
  pairwise: Record<string, number>;
  selectedParent: string;
  loading: boolean;
  saving: boolean;
  onSelectParent: (id: string) => void;
  onSetPair: (iId: string, jId: string, val: number) => void;
  onSave: () => void;
}

export default function AHPLevel2({
  parentCriteria,
  criteria,
  pairwise,
  selectedParent,
  loading,
  saving,
  onSelectParent,
  onSetPair,
  onSave,
}: Props) {
  return (
    <details className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
      <summary className="flex items-center justify-between cursor-pointer select-none">
        <span className="text-xl font-semibold text-white">
          AHP - So sánh cặp tiêu chí (Level 2)
        </span>
        <span className="text-xs text-gray-400">Mở/đóng</span>
      </summary>

      <div className="mt-4 flex items-center justify-between gap-3 mb-4">
        <select
          value={selectedParent}
          onChange={(e) => onSelectParent(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
        >
          <option value="">-- Chọn tiêu chí cha --</option>
          {parentCriteria.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm border border-gray-600 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu so sánh"}
        </button>
      </div>

      {!selectedParent ? (
        <div className="text-gray-400 text-sm">
          Vui lòng chọn tiêu chí cha để so sánh các tiêu chí con.
        </div>
      ) : loading ? (
        <div className="text-gray-400 text-sm">Đang tải tiêu chí con...</div>
      ) : criteria.length < 2 ? (
        <div className="text-gray-400 text-sm">
          Chưa đủ tiêu chí con để so sánh.
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((ci, idx) => (
            <div key={ci.id} className="space-y-3">
              {criteria.slice(idx + 1).map((cj) => {
                const key = `${ci.id}|${cj.id}`;
                const current = pairwise[key] ?? 1;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border border-gray-800 rounded-lg p-3"
                  >
                    <div className="text-gray-300 text-sm">
                      {ci.name} so với {cj.name}
                    </div>
                    <select
                      value={current}
                      onChange={(e) =>
                        onSetPair(ci.id, cj.id, Number(e.target.value))
                      }
                      className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                    >
                      {renderSaatyOptions()}
                    </select>
                    <div className="text-xs text-gray-500">
                      Chọn mức độ ưu tiên của "{ci.name}" so với "{cj.name}"
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

function renderSaatyOptions() {
  return [
    { v: 0.111, label: "1/9 - Cực kém" },
    { v: 0.125, label: "1/8" },
    { v: 0.142, label: "1/7" },
    { v: 0.167, label: "1/6" },
    { v: 0.2, label: "1/5" },
    { v: 0.25, label: "1/4" },
    { v: 0.333, label: "1/3" },
    { v: 0.5, label: "1/2" },
    { v: 1, label: "1 - Bằng nhau" },
    { v: 2, label: "2 - Hơi hơn" },
    { v: 3, label: "3 - Hơn" },
    { v: 4, label: "4" },
    { v: 5, label: "5 - Mạnh" },
    { v: 6, label: "6" },
    { v: 7, label: "7 - Rất mạnh" },
    { v: 8, label: "8" },
    { v: 9, label: "9 - Cực mạnh" },
  ].map((o) => (
    <option key={o.v} value={o.v}>
      {o.label}
    </option>
  ));
}
