import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Calendar,
  Video,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  Shield,
  Sparkles,
  BarChart3,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Relatórios' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/live', icon: Video, label: 'Iniciar Live' },
  { to: '/tutorials', icon: GraduationCap, label: 'Tutoriais' },
]

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Painel Admin' },
  { to: '/admin/users', icon: Users, label: 'Usuarios' },
  { to: '/admin/tutorials', icon: Settings, label: 'Gerenciar Tutoriais' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">MegaJu</h1>
            <p className="text-xs text-white/40">Live Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
          Menu Principal
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="my-4 border-t border-white/5" />
            <p className="px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
              Administracao
            </p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5 nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 nav-item text-red-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
