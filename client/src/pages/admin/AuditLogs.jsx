import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { auditAPI } from '../../services/api'
import {
  FileText,
  Search,
  Filter,
  User,
  Video,
  BookOpen,
  Settings,
  Shield,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Play,
  Square,
  Package,
} from 'lucide-react'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [entityFilter, setEntityFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    actionCounts: {},
    entityCounts: {},
  })
  const logsPerPage = 20

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: logsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(actionFilter !== 'all' && { action: actionFilter }),
      }

      const response = await auditAPI.getLogs(params)
      setLogs(response.data.data)
      setTotal(response.data.pagination.total)
      setTotalPages(response.data.pagination.totalPages)
    } catch (err) {
      console.error('Erro ao carregar logs:', err)
      setError('Erro ao carregar logs de auditoria')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, entityFilter, actionFilter])

  const loadStats = useCallback(async () => {
    try {
      const response = await auditAPI.getStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const getEntityIcon = (entity) => {
    switch (entity) {
      case 'USER': return User
      case 'LIVE': return Video
      case 'PRODUCT': return Package
      case 'AUTH': return Shield
      default: return FileText
    }
  }

  const getEntityColor = (entity) => {
    switch (entity) {
      case 'USER': return 'bg-blue-500/20 text-blue-400'
      case 'LIVE': return 'bg-violet-500/20 text-violet-400'
      case 'PRODUCT': return 'bg-emerald-500/20 text-emerald-400'
      case 'AUTH': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-white/5 text-slate-300'
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return CheckCircle
      case 'UPDATE': return Info
      case 'DELETE': return XCircle
      case 'LOGIN': return CheckCircle
      case 'LOGOUT': return Info
      case 'START_LIVE': return Play
      case 'END_LIVE': return Square
      default: return AlertTriangle
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'text-emerald-500'
      case 'UPDATE': return 'text-blue-500'
      case 'DELETE': return 'text-red-500'
      case 'LOGIN': return 'text-emerald-500'
      case 'LOGOUT': return 'text-slate-400'
      case 'START_LIVE': return 'text-violet-500'
      case 'END_LIVE': return 'text-orange-500'
      default: return 'text-amber-500'
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE': return 'Criou'
      case 'UPDATE': return 'Atualizou'
      case 'DELETE': return 'Excluiu'
      case 'LOGIN': return 'Login'
      case 'LOGOUT': return 'Logout'
      case 'START_LIVE': return 'Iniciou live'
      case 'END_LIVE': return 'Encerrou live'
      default: return action
    }
  }

  const getEntityLabel = (entity) => {
    switch (entity) {
      case 'USER': return 'Usuario'
      case 'LIVE': return 'Live'
      case 'PRODUCT': return 'Produto'
      case 'AUTH': return 'Autenticacao'
      default: return entity
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Agora mesmo'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atras`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atras`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const buildDescription = (log) => {
    let details = {}
    try { details = log.details ? JSON.parse(log.details) : {} } catch {}
    const actionLabel = getActionLabel(log.action)
    const entityLabel = getEntityLabel(log.entity).toLowerCase()

    if (log.action === 'LOGIN' || log.action === 'LOGOUT') {
      return `${actionLabel} realizado`
    }

    if (details.title) {
      return `${actionLabel} ${entityLabel}: ${details.title}`
    }
    if (details.name) {
      return `${actionLabel} ${entityLabel}: ${details.name}`
    }
    if (details.email) {
      return `${actionLabel} ${entityLabel}: ${details.email}`
    }

    return `${actionLabel} ${entityLabel}`
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleEntityFilter = (e) => {
    setEntityFilter(e.target.value)
    setPage(1)
  }

  const handleActionFilter = (e) => {
    setActionFilter(e.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Logs de Auditoria</h1>
        <p className="text-slate-400 mt-1">Historico de acoes realizadas no sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <FileText className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalLogs}</p>
              <p className="text-xs text-slate-400">Total de logs</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.todayLogs}</p>
              <p className="text-xs text-slate-400">Hoje</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.entityCounts?.USER || 0}</p>
              <p className="text-xs text-slate-400">Usuarios</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.entityCounts?.AUTH || 0}</p>
              <p className="text-xs text-slate-400">Autenticacao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar nos logs..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-white/30 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={entityFilter}
              onChange={handleEntityFilter}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Todas as entidades</option>
              <option value="USER">Usuarios</option>
              <option value="LIVE">Lives</option>
              <option value="PRODUCT">Produtos</option>
              <option value="AUTH">Autenticacao</option>
            </select>
          </div>
          <select
            value={actionFilter}
            onChange={handleActionFilter}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todas as acoes</option>
            <option value="CREATE">Criacao</option>
            <option value="UPDATE">Atualizacao</option>
            <option value="DELETE">Exclusao</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="START_LIVE">Iniciar Live</option>
            <option value="END_LIVE">Encerrar Live</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {logs.map((log) => {
              const EntityIcon = getEntityIcon(log.entity)
              const ActionIcon = getActionIcon(log.action)

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 hover:bg-white/3 transition-colors"
                >
                  <div className={`p-2 rounded-xl ${getEntityColor(log.entity)}`}>
                    <EntityIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ActionIcon className={`w-4 h-4 ${getActionColor(log.action)}`} />
                      <span className="font-medium text-white">{buildDescription(log)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user?.name || 'Sistema'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(log.createdAt)}
                      </span>
                      {log.ipAddress && (
                        <span className="text-slate-400">IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getEntityColor(log.entity)}`}>
                    {getEntityLabel(log.entity)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400">Nenhum log encontrado</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/4">
            <p className="text-sm text-slate-400">
              Mostrando {(page - 1) * logsPerPage + 1} a {Math.min(page * logsPerPage, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-300">
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
