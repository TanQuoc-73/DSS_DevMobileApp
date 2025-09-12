'use client';

import React, { useState } from 'react';
import { Smartphone, Menu, X, BarChart3, Users, Zap, ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, loading, signInWithGoogle, signOut } = useUser();

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-800/20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-2 rounded-lg shadow-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                DSS Mobile
              </h1>
              <p className="text-xs text-gray-400 font-medium">Decision Support System</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Trang chủ
            </a>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                <span>Giải pháp</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                  }`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Phân tích dữ liệu</div>
                      <div className="text-sm text-gray-500">Báo cáo và thống kê</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Quản lý dự án</div>
                      <div className="text-sm text-gray-500">Theo dõi tiến độ</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Zap className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Tối ưu hóa</div>
                      <div className="text-sm text-gray-500">Hiệu suất ứng dụng</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Tài liệu
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Liên hệ
            </a>
          </nav>

          {/* CTA Button và Mobile Menu */}
          <div className="flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="font-medium">{user.email}</span>
                  <button
                    onClick={signOut}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600"
                >
                  Đăng nhập Google
                </button>
              )
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
                Trang chủ
              </a>
              <div className="space-y-2">
                <div className="text-gray-300 font-medium">Giải pháp</div>
                <div className="pl-4 space-y-2">
                  <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    <span>Phân tích dữ liệu</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <Users className="h-4 w-4" />
                    <span>Quản lý dự án</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <Zap className="h-4 w-4" />
                    <span>Tối ưu hóa</span>
                  </a>
                </div>
              </div>
              <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
                Tài liệu
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
                Liên hệ
              </a>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-left border border-gray-600">
                Bắt đầu ngay
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
