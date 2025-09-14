'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/services/sessionService';
import { Plus } from 'lucide-react';

export default function NewSessionPage() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSession(projectName, description);
    router.push('/sessions');
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      {/* Header Section */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Tạo Phiên Phân Tích Mới
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Nhập thông tin dự án để bắt đầu phân tích DSS
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 shadow-lg space-y-6"
          >
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tên dự án <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên dự án..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mô tả
              </label>
              <textarea
                placeholder="Mô tả ngắn gọn về phiên phân tích..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 border border-gray-600 shadow-lg hover:shadow-xl group"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Tạo Session</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
