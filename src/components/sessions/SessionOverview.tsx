import { Calendar, BarChart3 } from "lucide-react";
import { Session } from "@/types/sessions";

export default function SessionOverview({ session }: { session: Session }) {
  return (
    <div
      id="overview"
      className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700"
    >
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
  );
}
