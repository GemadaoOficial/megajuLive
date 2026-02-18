import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useTraining } from '../../contexts/TrainingContext'
import {
  LayoutDashboard,
  Calendar,
  Video,
  GraduationCap,
  Shield,
  Users,
  Settings,
  LogOut,
  Flame,
  Lock,
  BarChart3,
} from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const { isTrainingComplete, progressPercent } = useTraining()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Check if user is admin (admins always have access)
  const isAdmin = user?.role === 'ADMIN'
  const canAccessLive = isAdmin || isTrainingComplete

  const mainTabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'Relatórios' },
    { to: '/calendar', icon: Calendar, label: 'Agenda' },
    { to: '/live', icon: Video, label: 'Go Live', highlight: true, requiresTraining: true },
    { to: '/tutorials', icon: GraduationCap, label: 'Aprenda' },
  ]

  const adminTabs = [
    { to: '/admin', icon: Shield, label: 'Painel' },
    { to: '/admin/users', icon: Users, label: 'Equipe' },
    { to: '/admin/tutorials', icon: Settings, label: 'Conteudo' },
  ]

  const isActive = (path) => location.pathname === path

  const handleTabClick = (e, tab) => {
    if (tab.requiresTraining && !canAccessLive) {
      e.preventDefault()
      navigate('/tutorials')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient line on top */}
      <div className="h-1 bg-gradient-to-r from-primary via-orange-500 to-amber-500" />

      <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Mega<span className="text-primary">Ju</span></h1>
                <p className="text-[10px] text-slate-400 -mt-1">Live Management</p>
              </div>
            </NavLink>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center bg-white/[0.05] rounded-2xl p-1.5">
                {mainTabs.map((tab) => {
                  const isLocked = tab.requiresTraining && !canAccessLive

                  return (
                    <NavLink
                      key={tab.to}
                      to={isLocked ? '#' : tab.to}
                      onClick={(e) => handleTabClick(e, tab)}
                      className="relative group"
                    >
                      {isActive(tab.to) && !isLocked && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 ${tab.highlight ? 'bg-gradient-to-r from-primary to-orange-500' : 'bg-white/[0.1]'} rounded-xl`}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors
                        ${isLocked
                          ? 'text-slate-500 cursor-not-allowed'
                          : isActive(tab.to)
                            ? tab.highlight ? 'text-white' : 'text-white'
                            : tab.highlight
                              ? 'text-primary hover:text-orange-400'
                              : 'text-slate-400 hover:text-white'
                        }
                        ${tab.highlight && !isActive(tab.to) && !isLocked ? 'hover:bg-primary/10' : ''}
                      `}>
                        {isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <tab.icon className="w-4 h-4" />
                        )}
                        {tab.label}
                        {isLocked && (
                          <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-full">
                            {progressPercent}%
                          </span>
                        )}
                        {tab.highlight && !isActive(tab.to) && !isLocked && (
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                          </span>
                        )}
                      </div>

                      {/* Tooltip for locked */}
                      {isLocked && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                          Complete o treinamento para desbloquear
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                        </div>
                      )}
                    </NavLink>
                  )
                })}
              </div>

              {/* Admin Tabs */}
              {user?.role === 'ADMIN' && (
                <div className="flex items-center ml-3 pl-3 border-l border-white/[0.08]">
                  {adminTabs.map((tab) => (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive(tab.to)
                          ? 'text-amber-400 bg-amber-500/15'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                        }`
                      }
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <NavLink
                to="/profile"
                className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400">
                    {user?.role === 'ADMIN' ? 'Administrador' : 'Analista'}
                  </p>
                </div>
              </NavLink>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
