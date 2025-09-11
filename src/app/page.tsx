import React from 'react';
import { BarChart3, Users, Zap, ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Hệ thống Hỗ trợ
            <br />
            <span className="bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              Ra quyết định DSS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Phát triển ứng dụng di động thông minh với công nghệ DSS tiên tiến, 
            tối ưu hóa quy trình ra quyết định cho doanh nghiệp hiện đại
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-600">
              Khám phá ngay
            </button>
            <button className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800/50 transition-all duration-300 hover:border-gray-500">
              Xem demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Khám phá các tính năng mạnh mẽ giúp tối ưu hóa quy trình phát triển ứng dụng di động
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group hover:transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Phân tích thông minh</h3>
              <p className="text-gray-400 leading-relaxed">
                Xử lý dữ liệu phức tạp và đưa ra thống kê chi tiết, 
                giúp đưa ra quyết định chính xác dựa trên dữ liệu thực tế.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group hover:transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Quản lý hiệu quả</h3>
              <p className="text-gray-400 leading-relaxed">
                Điều phối nhóm và theo dõi tiến độ dự án real-time,
                đảm bảo mọi thành viên đều đồng bộ và hiệu quả.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group hover:transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Tối ưu hiệu suất</h3>
              <p className="text-gray-400 leading-relaxed">
                Cải thiện tốc độ và trải nghiệm người dùng,
                đảm bảo ứng dụng chạy mượt mà trên mọi thiết bị.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tại sao chọn DSS Mobile?
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Chúng tôi cung cấp giải pháp toàn diện cho việc phát triển ứng dụng di động,
                từ ý tưởng đến triển khai thực tế.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">Công nghệ tiên tiến và cập nhật liên tục</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">Hỗ trợ 24/7 từ đội ngũ chuyên gia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">Tích hợp dễ dàng với hệ thống hiện có</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">Bảo mật cao và tuân thủ tiêu chuẩn quốc tế</span>
                </div>
              </div>
              
              <button className="mt-8 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 border border-gray-600 flex items-center space-x-2 group">
                <span>Tìm hiểu thêm</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Đánh giá từ khách hàng</h3>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <blockquote className="text-gray-300 text-lg italic text-center mb-6">
                "DSS Mobile đã giúp chúng tôi tiết kiệm 40% thời gian phát triển và 
                cải thiện chất lượng ứng dụng đáng kể. Đây là giải pháp tuyệt vời!"
              </blockquote>
              
              <div className="text-center">
                <div className="font-semibold text-white">Nguyễn Văn A</div>
                <div className="text-gray-400">CTO - Tech Company</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn doanh nghiệp đã tin tưởng DSS Mobile 
            để phát triển ứng dụng di động thành công.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-600">
              Dùng thử miễn phí
            </button>
            <button className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800/50 transition-all duration-300 hover:border-gray-500">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}