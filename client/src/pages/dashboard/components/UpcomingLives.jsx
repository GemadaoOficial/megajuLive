import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, ChevronRight } from 'lucide-react'
import { livesAPI } from '../../../services/api'
import { Link } from 'react-router-dom'

export default function UpcomingLives() {
  const [upcomingLives, setUpcomingLives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpcomingLives()
  }, [])

  const loadUpcomingLives = async () => {
    try {
      const response = await livesAPI.getAll()
      const lives = response.data.data || response.data.lives || []

      // Filter upcoming lives (SCHEDULED status)
      const upcoming = lives
        .filter((live) => live.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5)

      setUpcomingLives(upcoming)
    } catch (error) {
      console.error('Erro ao carregar próximas lives:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeUntil = (date) => {
    const now = new Date()
    const scheduled = new Date(date)
    const diff = scheduled - now

    if (diff < 0) return 'Atrasada'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `Em ${days}d ${hours}h`
    if (hours > 0) return `Em ${hours}h ${minutes}m`
    return `Em ${minutes}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 border border-white/8 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Próximas Lives</h2>
            <p className="text-sm text-slate-400">Suas próximas transmissões</p>
          </div>
        </div>
        <Link
          to="/calendar"
          className="text-primary text-sm font-medium hover:text-orange-400 transition-colors flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Upcoming Lives List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : upcomingLives.length > 0 ? (
        <div className="space-y-3">
          {upcomingLives.map((live, index) => (
            <motion.div
              key={live.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3 hover:bg-violet-500/10 border border-white/4 hover:border-violet-500/30 transition-all cursor-pointer">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                    {live.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(live.scheduledAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(live.scheduledAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400">
                    {getTimeUntil(live.scheduledAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Calendar className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 mb-4">Nenhuma live agendada</p>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            <Video className="w-4 h-4" />
            Agendar Live
          </Link>
        </div>
      )}
    </motion.div>
  )
}
