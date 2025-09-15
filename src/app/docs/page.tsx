export default function DocsPage() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50" />
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Tài liệu
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Tài liệu hướng dẫn sử dụng hệ thống DSS Mobile. Nội dung dưới đây là placeholder, bạn có thể bổ sung dần.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Bắt đầu</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Đăng nhập bằng Google.</li>
              <li>Tạo Session mới để bắt đầu phân tích.</li>
              <li>Quản lý danh sách session tại trang Phiên phân tích.</li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Các module (dự kiến)</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Nhập yêu cầu dự án (Project Requirements)</li>
              <li>Phân tích nền tảng và chấm điểm</li>
              <li>AHP: so sánh cặp tiêu chí và xếp hạng</li>
              <li>Khuyến nghị & Báo cáo</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
