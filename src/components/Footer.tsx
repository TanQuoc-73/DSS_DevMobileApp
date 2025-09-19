export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo / Tên website */}
        <div className="text-lg font-semibold text-gray-200">
          DSS Decision Support System
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 text-sm">
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/sessions" className="hover:text-white transition-colors">Sessions</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        {/* Bản quyền */}
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} DSS Project. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
