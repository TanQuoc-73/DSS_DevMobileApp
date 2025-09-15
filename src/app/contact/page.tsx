export default function ContactPage() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50" />
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Liên hệ
          </h1>
          <p className="text-gray-300 text-lg mt-2">
            Mọi thắc mắc hoặc yêu cầu hợp tác, vui lòng liên hệ với chúng tôi. Nội dung dưới đây là placeholder.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Thông tin</h2>
            <ul className="text-gray-300 space-y-2">
              <li>Email: dss-mobile@example.com</li>
              <li>Phone: +84 000 000 000</li>
              <li>Địa chỉ: TP. Hồ Chí Minh</li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Gửi lời nhắn</h2>
            <form className="space-y-4">
              <input className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500" placeholder="Họ và tên" />
              <input className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500" placeholder="Email" />
              <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500" placeholder="Nội dung"></textarea>
              <button type="button" className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-600">
                Gửi
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
