"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function SessionAhpPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AHP - So sánh & đánh giá</h1>
          <Link href={`/sessions/${sessionId}`} className="text-sm text-gray-300 hover:text-white">← Quay lại phiên</Link>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 space-y-3">
          <p className="text-gray-300 text-sm">Trang con để thực hiện AHP (Level 1, Level 2, Alternatives vs Criteria) cho session {String(sessionId)}.</p>
          <p className="text-gray-400 text-sm">Các form/matrix sẽ được chuyển từ trang chính sang đây.</p>
        </div>
      </div>
    </div>
  );
}
