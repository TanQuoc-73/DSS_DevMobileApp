"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, BarChart3 } from "lucide-react";
import { getSessionById } from "@/services/sessionService";

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

              {/* Placeholders for next features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-3">Yêu cầu dự án</h3>
                  <p className="text-gray-400 text-sm">
                    Khu vực để nhập ngân sách, timeline, thị trường mục tiêu, nguồn lực đội ngũ, ưu tiên...
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-3">Phân tích & AHP</h3>
                  <p className="text-gray-400 text-sm">
                    Khu vực hiển thị điểm số nền tảng, so sánh cặp tiêu chí và kết quả xếp hạng.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
