'use client';

import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link'; 

export default function NewSessionPage() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert('Vui lòng nhập tên dự án');
      return;
    }
    
    // Simulate creating session
    alert(`Session "${projectName}" đã được tạo thành công!`);
    
    // Reset form
    setProjectName('');
    setDescription('');
  };

  const handleBack = () => {
    alert('Quay về danh sách sessions...');
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      {/* Header Section */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50"></div>
        <div className="relative max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>
                <Link href="/sessions">Quay lại danh sách</Link>
            </span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Tạo Session Phân Tích Mới
          </h1>
          <p className="text-gray-300 text-lg mt-4">
            Bắt đầu một phiên phân tích quyết định mới cho dự án của bạn
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700">
            <div className="space-y-6">
              {/* Project Name Input */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Tên Dự Án *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên dự án..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
                  required
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Mô Tả
                </label>
                <textarea
                  placeholder="Mô tả chi tiết về dự án..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                />
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!projectName.trim()}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 border border-gray-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Tạo Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}