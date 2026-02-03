import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, User, Video, Shield, Plus, Edit, Trash2, LogIn, LogOut, Play, Square } from 'lucide-react'
import { auditAPI } from '../../../services/api'

const getActionIcon = (action) => {
  switch (action) {
    case 'CREATE':
      return Plus
    case 'UPDATE':
      return Edit
    case 'DELETE':
      return Trash2
    case 'LOGIN':
      return LogIn
    case 'LOGOUT':
      return LogOut
    case 'START_LIVE':
      return Play
    case 'END_LIVE':
      return Square
    default:
      return Activity
  }
}

const getActionColor = (action) => {
  switch (action) {
    case 'CREATE':
      return 'text-emerald-500 bg-emerald-50'
    case 'UPDATE':
      return 'text-blue-500 bg-blue-50'
    case 'DELETE':
      return 'text-red-500 bg-red-50'
    case 'LOGIN':
      return 'text-green-500 bg-green-50'
    case 'LOGOUT':
      return 'text-slate-500 bg-slate-50'
    case 'START_LIVE':
      return 'text-violet-500 bg-violet-50'
    case 'END_LIVE':
      return 'text-orange-500 bg-orange-50'
    default:
      return 'text-slate-500 bg-slate-50'
  }
}

const getActionLabel = (action) => {
  const labels = {
    CREATE: 'Criou',
    UPDATE: 'Atualizou',
    DELETE: 'Excluiu',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    START_LIVE: 'Iniciou live',
    END_LIVE: 'Encerrou live',
  }
  return labels[action] || action
}

const getEntityLabel = (entity) => {
  const labels = {
    USER: 'usuário',
    LIVE: 'live',
    PRODUCT: 'produto',
    AUTH: 'autenticação',
  }
  return labels[entity] || entity
}

export default function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      const response = await auditAPI.getLogs({ limit: 10, page: 1 })
      setActivities(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const buildDescription = (log) => {
    const details = log.details ? JSON.parse(log.details) : {}
    const actionLabel = getActionLabel(log.action)
    const entityLabel = getEntityLabel(log.entity)

    if (log.action === 'LOGIN' || log.action === 'LOGOUT') {
      return actionLabel
    }

    if (details.title) {
      return `${actionLabel} ${entityLabel}: ${details.title}`
    }
    if (details.name) {
      return `${actionLabel} ${entityLabel}: ${details.name}`
    }

    return `${actionLabel} ${entityLabel}`
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Agora mesmo'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Atividade Recente</h2>
          <p className="text-sm text-slate-500">Últimas ações no sistema</p>
        </div>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => {
            const ActionIcon = getActionIcon(activity.action)
            const colorClass = getActionColor(activity.action)

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <ActionIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {buildDescription(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user?.name || 'Sistema'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {formatTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">Nenhuma atividade recente</p>
        </div>
      )}
    </motion.div>
  )
}
