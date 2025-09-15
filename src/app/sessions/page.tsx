'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Trash2, BarChart3, Calendar, User, Search, Filter } from 'lucide-react';
import { getSessions, deleteSession } from '@/services/sessionService';
import { useUser } from '@/contexts/UserContext';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (authLoading) return; // Chờ xác thực xong
      if (!user) {
        // Không đăng nhập: dừng loading và xóa dữ liệu
        if (!isMounted) return;
        setSessions([]);
        setLoading(false);
        return;
      }
      await loadSessions(isMounted);
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  const loadSessions = async (isMounted: boolean = true) => {
    try {
      setLoading(true);
      const data = await getSessions();
      if (!isMounted) return;
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isMounted) return;
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa session này không?')) {
      try {
        await deleteSession(id);
        loadSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

    function handleViewSession(id: string) {
        window.location.href = `/sessions/${id}`;
    }

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      {/* Header Section */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
                Phiên Phân Tích DSS
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                Quản lý và theo dõi các phiên phân tích quyết định của bạn
              </p>
            </div>
            
            <Link
              href="/sessions/new"
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 border border-gray-600 flex items-center space-x-2 group w-fit"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Tạo Session Mới</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên dự án hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gray-800 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition-all duration-300">
                <Filter className="h-5 w-5" />
                <span>Lọc</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-20">
              <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchTerm ? 'Không tìm thấy session nào' : 'Chưa có session nào'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc tạo session mới'
                  : 'Tạo session đầu tiên để bắt đầu phân tích quyết định'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  <span>Tạo Session Đầu Tiên</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group hover:transform hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(session.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-gray-200 transition-colors">
                    {session.project_name || 'Untitled Project'}
                  </h3>
                  
                  <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                    {session.description || 'Không có mô tả'}
                  </p>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                      Hoạt động
                    </span>
                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                      <User className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewSession(session.id)}
                      className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 group/btn"
                    >
                      <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      <span>Xem Chi Tiết</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center border border-red-600/30 hover:border-red-600 group/btn"
                    >
                      <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination or Load More could go here */}
          {filteredSessions.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-400">
                Hiển thị {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}