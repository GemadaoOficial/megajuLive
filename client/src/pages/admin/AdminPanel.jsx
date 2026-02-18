import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import AnalyticsCharts from './components/AnalyticsCharts'
import {
  Users,
  Video,
  DollarSign,
  Eye,
  ArrowUpRight,
  BookOpen,
  Settings,
  FileText,
  Activity,
  HardDrive,
  Shield,
} from 'lucide-react'

export default function AdminPanel() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLives: 0,
    totalRevenue: 0,
    totalViews: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await adminAPI.getAnalytics()
      setStats(response.data.stats || {})
      setRecentActivity(response.data.recentActivity || [])
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      label: 'Total de Usuarios',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-primary to-orange-500',
      bgColor: 'bg-primary/10',
      change: '+5 este mes',
      to: '/admin/users',
    },
    {
      label: 'Total de Lives',
      value: stats.totalLives,
      icon: Video,
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-500/100/20',
      change: '+23 esta semana',
      to: '/admin/lives',
    },
    {
      label: 'Receita Total',
      value: `R$ ${(stats.totalRevenue || 0).toLocaleString('pt-BR')}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/100/100/20',
      change: '+12.5%',
      to: null,
    },
    {
      label: 'Visualizacoes',
      value: `${((stats.totalViews || 0) / 1000).toFixed(1)}K`,
      icon: Eye,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/100/100/20',
      change: '+18.3%',
      to: null,
    },
  ]

  const quickActions = [
    {
      label: 'Gerenciar Usuarios',
      description: 'Adicionar, editar ou remover usuarios',
      icon: Users,
      to: '/admin/users',
      color: 'primary',
    },
    {
      label: 'Gerenciar Lives',
      description: 'Ver e controlar todas as transmissoes',
      icon: Video,
      to: '/admin/lives',
      color: 'violet',
    },
    {
      label: 'Gerenciar Tutoriais',
      description: 'Criar e editar modulos educativos',
      icon: BookOpen,
      to: '/admin/tutorials',
      color: 'emerald',
    },
    {
      label: 'Logs de Auditoria',
      description: 'Ver historico de acoes do sistema',
      icon: FileText,
      to: '/admin/logs',
      color: 'amber',
    },
    {
      label: 'Backup',
      description: 'Exportar e restaurar dados do sistema',
      icon: HardDrive,
      to: '/admin/backup',
      color: 'sky',
    },
    {
      label: 'Configuracoes',
      description: 'Chaves e segredos criptografados',
      icon: Shield,
      to: '/admin/settings',
      color: 'rose',
    },
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return Users
      case 'live': return Video
      case 'tutorial': return BookOpen
      default: return Activity
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-slate-400 mt-1">Visao geral e controle do sistema</p>
        </div>
        <Link
          to="/admin/settings"
          className="p-3 rounded-xl bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsCards.map((stat) => {
            const Card = stat.to ? Link : 'div'
            return (
              <motion.div key={stat.label} variants={item}>
                <Card
                  to={stat.to}
                  className={`block bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6 hover:shadow-md transition-all ${
                    stat.to ? 'cursor-pointer hover:border-primary/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className="w-6 h-6" style={{
                        color: stat.gradient.includes('primary') ? '#EE4D2D'
                          : stat.gradient.includes('violet') ? '#8B5CF6'
                          : stat.gradient.includes('emerald') ? '#10B981'
                          : '#F59E0B'
                      }} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-white mb-6">Acoes Rapidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors ${
                action.color === 'primary' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' :
                action.color === 'violet' ? 'bg-violet-500/100/20 text-violet-400 group-hover:bg-violet-500/100 group-hover:text-white' :
                action.color === 'emerald' ? 'bg-emerald-500/100/100/20 text-emerald-400 group-hover:bg-emerald-500/100/100/100/100 group-hover:text-white' :
                action.color === 'sky' ? 'bg-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-white' :
                action.color === 'rose' ? 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white' :
                'bg-amber-500/100/100/20 text-amber-400 group-hover:bg-amber-500/100/100 group-hover:text-white'
              }`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                {action.label}
              </h3>
              <p className="text-slate-400 text-sm mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Atividade Recente</h2>
          <Link
            to="/admin/logs"
            className="text-primary text-sm font-medium hover:text-orange-400 transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-200">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
