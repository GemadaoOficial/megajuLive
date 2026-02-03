import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../../services/api'
import Modal from '../../components/ui/Modal'
import {
  Video,
  Search,
  Eye,
  Calendar,
  User,
  Clock,
  Filter,
  Play,
  StopCircle,
  Trash2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function LivesManagement() {
  const [lives, setLives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLive, setSelectedLive] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const livesPerPage = 10

  const loadLives = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: livesPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy: 'scheduledAt',
        sortOrder: 'desc',
      }

      const response = await adminAPI.getLives(params)
      setLives(response.data.data)
      setTotal(response.data.pagination.total)
      setTotalPages(response.data.pagination.totalPages)
    } catch (err) {
      console.error('Erro ao carregar lives:', err)
      setError('Erro ao carregar lives')
      setLives([])
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, statusFilter])

  useEffect(() => {
    loadLives()
  }, [loadLives])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-100 text-red-600 animate-pulse'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-600'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-600'
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'LIVE': return '● AO VIVO'
      case 'COMPLETED': return 'Finalizada'
      case 'SCHEDULED': return 'Agendada'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setPage(1)
  }

  const stats = {
    total: total,
    live: lives.filter(l => l.status === 'LIVE').length,
    scheduled: lives.filter(l => l.status === 'SCHEDULED').length,
    completed: lives.filter(l => l.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gestao de Lives</h1>
        <p className="text-slate-500 mt-1">Visualize e gerencie todas as transmissoes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Video className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Play className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.live}</p>
              <p className="text-xs text-slate-500">Ao Vivo</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              <p className="text-xs text-slate-500">Agendadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <StopCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-xs text-slate-500">Finalizadas</p>
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
            placeholder="Buscar por titulo ou usuario..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos os status</option>
            <option value="LIVE">Ao Vivo</option>
            <option value="SCHEDULED">Agendadas</option>
            <option value="COMPLETED">Finalizadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Lives Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Live</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Duracao</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Vendas</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lives.map((live) => (
                  <tr key={live.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">
                          {live.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{live.user?.name || 'Usuario'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(live.status)}`}>
                        {getStatusLabel(live.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(live.scheduledAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatDuration(live.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-slate-400" />
                        {(live.analytics?.views || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-emerald-600 font-medium">
                        R$ {(live.analytics?.revenue || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">{live.analytics?.sales || 0} vendas</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLive(live)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                          title="Ver detalhes"
                        >
                          <BarChart3 className="w-5 h-5" />
                        </button>
                        {live.status === 'LIVE' && (
                          <button
                            className="p-2 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors"
                            title="Encerrar live"
                          >
                            <StopCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          className="p-2 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && lives.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">Nenhuma live encontrada</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Mostrando {(page - 1) * livesPerPage + 1} a {Math.min(page * livesPerPage, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-600">
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Live Detail Modal */}
      <Modal
        isOpen={!!selectedLive}
        onClose={() => setSelectedLive(null)}
        title="Detalhes da Live"
        size="lg"
      >
        {selectedLive && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedLive.title}</h3>
                <p className="text-white/80">por {selectedLive.user?.name || 'Usuario'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Status</p>
                <span className={`inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-semibold ${getStatusStyle(selectedLive.status)}`}>
                  {getStatusLabel(selectedLive.status)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Visualizacoes</p>
                <p className="text-xl font-bold text-slate-800">{(selectedLive.analytics?.views || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Vendas</p>
                <p className="text-xl font-bold text-slate-800">{selectedLive.analytics?.sales || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Receita</p>
                <p className="text-xl font-bold text-emerald-600">R$ {(selectedLive.analytics?.revenue || 0).toLocaleString()}</p>
              </div>
            </div>

            {selectedLive.description && (
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500 mb-2">Descricao</p>
                <p className="text-slate-700">{selectedLive.description}</p>
              </div>
            )}

            {selectedLive.products && selectedLive.products.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500 mb-2">Produtos ({selectedLive.products.length})</p>
                <div className="space-y-2">
                  {selectedLive.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-slate-700">{product.name}</span>
                      <span className="text-emerald-600 font-medium">R$ {product.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedLive(null)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
