"use client";

import { ProjectRequirementsPayload } from "@/services/requirementsService";

interface Props {
  requirements: ProjectRequirementsPayload;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirementsPayload>>;
  reqSaving: boolean;
  reqLoading: boolean;
  saveMessage: string | null;
  onSave: (e: React.FormEvent) => void;
}

export default function RequirementsForm({
  requirements,
  setRequirements,
  reqSaving,
  reqLoading,
  saveMessage,
  onSave,
}: Props) {
  return (
    <form
      id="requirements"
      onSubmit={onSave}
      className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4"
    >
      <h3 className="text-xl font-semibold text-white">Yêu cầu dự án</h3>

      {reqLoading && (
        <div className="text-gray-400 text-sm">Đang tải yêu cầu dự án...</div>
      )}

      {/* Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldSelect
          label="Khoảng ngân sách"
          value={requirements.budget_range ?? ""}
          options={[
            { value: "", label: "-- Chọn --" },
            { value: "<200M", label: "<200M" },
            { value: "200-500M", label: "200-500M" },
            { value: ">500M", label: ">500M" },
          ]}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              budget_range:
                val === "<200M" || val === "200-500M" || val === ">500M"
                  ? val
                  : undefined,
            }))
          }
        />
        <FieldInput
          label="Ngân sách (VND)"
          type="number"
          value={requirements.budget_amount ?? ""}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              budget_amount: val ? Number(val) : undefined,
            }))
          }
        />
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldInput
          label="Thời gian (tháng)"
          type="number"
          value={requirements.timeline_months ?? ""}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              timeline_months: val ? Number(val) : undefined,
            }))
          }
        />
        <FieldSelect
          label="Độ ưu tiên timeline"
          value={requirements.timeline_priority ?? ""}
          options={[
            { value: "", label: "-- Chọn --" },
            { value: "flexible", label: "Flexible" },
            { value: "strict", label: "Strict" },
          ]}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              timeline_priority: (val || null) as any,
            }))
          }
        />
      </div>

      {/* Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldSelect
          label="Nền tảng mục tiêu"
          value={requirements.target_platform ?? ""}
          options={[
            { value: "", label: "-- Chọn --" },
            { value: "android_priority", label: "Android ưu tiên" },
            { value: "ios_priority", label: "iOS ưu tiên" },
            { value: "both_equal", label: "Cả hai như nhau" },
          ]}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              target_platform: (val || null) as any,
            }))
          }
        />
        <FieldSelect
          label="Thị trường mục tiêu"
          value={requirements.target_market ?? ""}
          options={[
            { value: "", label: "-- Chọn --" },
            { value: "vietnam", label: "Việt Nam" },
            { value: "asia", label: "Châu Á" },
            { value: "global", label: "Toàn cầu" },
          ]}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              target_market: (val || null) as any,
            }))
          }
        />
      </div>

      {/* Users & Devs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldInput
          label="Người dùng kỳ vọng"
          type="number"
          value={requirements.expected_users ?? ""}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              expected_users: val ? Number(val) : undefined,
            }))
          }
        />
        <FieldInput
          label="Tổng số dev"
          type="number"
          value={requirements.total_developers ?? ""}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              total_developers: val ? Number(val) : undefined,
            }))
          }
        />
      </div>

      {/* Dev by skill */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FieldInput
          label="Android dev"
          type="number"
          value={requirements.android_developers ?? 0}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              android_developers: Number(val || 0),
            }))
          }
        />
        <FieldInput
          label="iOS dev"
          type="number"
          value={requirements.ios_developers ?? 0}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              ios_developers: Number(val || 0),
            }))
          }
        />
        <FieldInput
          label="Flutter dev"
          type="number"
          value={requirements.flutter_developers ?? 0}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              flutter_developers: Number(val || 0),
            }))
          }
        />
        <FieldInput
          label="React Native dev"
          type="number"
          value={requirements.react_native_developers ?? 0}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              react_native_developers: Number(val || 0),
            }))
          }
        />
      </div>

      {/* Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldInput
          label="Ưu tiên chi phí (1-5)"
          type="number"
          value={requirements.cost_priority ?? 3}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              cost_priority: Number(val || 3),
            }))
          }
        />
        <FieldInput
          label="Ưu tiên tốc độ (1-5)"
          type="number"
          value={requirements.speed_priority ?? 3}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              speed_priority: Number(val || 3),
            }))
          }
        />
        <FieldInput
          label="Ưu tiên chất lượng (1-5)"
          type="number"
          value={requirements.quality_priority ?? 3}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              quality_priority: Number(val || 3),
            }))
          }
        />
        <FieldInput
          label="Ưu tiên bảo trì (1-5)"
          type="number"
          value={requirements.maintenance_priority ?? 3}
          onChange={(val) =>
            setRequirements((r) => ({
              ...r,
              maintenance_priority: Number(val || 3),
            }))
          }
        />
      </div>

      {saveMessage && (
        <div className="text-sm text-gray-300">{saveMessage}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={reqSaving}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold border border-gray-600 disabled:opacity-60"
        >
          {reqSaving ? "Đang lưu..." : "Lưu yêu cầu"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- Helper Components ---------------- */

function FieldInput({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white"
      />
    </div>
  );
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
