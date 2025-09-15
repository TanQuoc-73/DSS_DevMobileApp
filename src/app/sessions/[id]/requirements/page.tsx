"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getRequirements, upsertRequirements, type ProjectRequirementsPayload } from "@/services/requirementsService";

export default function SessionRequirementsPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params?.id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const data = await getRequirements(sessionId);
        if (!mounted) return;
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
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    try {
      setSaving(true);
      setMessage(null);
      await upsertRequirements(sessionId, requirements);
      setMessage("Đã lưu yêu cầu dự án thành công.");
    } catch (e: any) {
      console.error(e);
      setMessage(e?.message || "Lưu yêu cầu dự án thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Yêu cầu dự án</h1>
          <Link href={`/sessions/${sessionId}`} className="text-sm text-gray-300 hover:text-white">← Quay lại phiên</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
          {loading && (
            <div className="text-gray-400 text-sm">Đang tải yêu cầu dự án...</div>
          )}

          {message && (
            <div className="text-sm text-gray-200">{message}</div>
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

          <div className="pt-2">
            <button disabled={saving} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white">
              {saving ? 'Đang lưu...' : 'Lưu yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
