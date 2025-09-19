"use client";
import { useState, useEffect } from "react";
import { getRequirements, upsertRequirements, type ProjectRequirementsPayload } from "@/services/requirementsService";

export function useRequirements(sessionId?: string) {
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getRequirements(sessionId);
        if (!mounted) return;
        if (data) setRequirements({ ...requirements, ...data });
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [sessionId]);

  const save = async () => {
    if (!sessionId) return;
    try {
      setSaving(true);
      await upsertRequirements(sessionId, requirements);
      setMessage("Đã lưu yêu cầu dự án thành công");
    } catch (e: any) {
      setMessage(e?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return { requirements, setRequirements, loading, saving, message, save };
}
