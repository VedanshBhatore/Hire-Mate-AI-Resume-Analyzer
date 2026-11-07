import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/Gemini_Generated_Image_etdiwxetdiwxetdi.png'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Upload Resume', path: '/upload', icon: '📄' },
  { label: 'Analytics', path: '/analytics', icon: '📈' },
]

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } relative flex flex-col bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 shadow-xl transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={logo}
              alt="ResumeAI logo"
              className={`h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-400/40 ${sidebarOpen ? '' : 'mx-auto'}`}
            />
            {sidebarOpen && (
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-lg font-extrabold text-transparent">
                ResumeAI
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1.5 p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`text-lg transition-transform ${active ? '' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-4">
          {sidebarOpen && (
            <p className="mb-2 truncate text-xs font-medium text-slate-400">
              {user?.name}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />
        </div>

        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ResumeAI logo" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
            <h1 className="text-lg font-bold text-slate-800">
              {navItems.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-500">{user?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
