import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Video, Eye, MessageCircle, ShoppingCart, Users, DollarSign, ChevronLeft, ChevronRight, Edit, ExternalLink } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

const fmtCurrency = (n) => `R$ ${(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtTime = (seconds) => {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`
  return `${m}min`
}

export default function LivesListTab({ period, startDate, endDate, onEdit }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadReports()
  }, [page, limit, period, startDate, endDate])

  useEffect(() => {
    setPage(1)
  }, [period, startDate, endDate])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await liveReportsAPI.getAll({
        page, limit, period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
      })
      setReports(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Erro ao carregar lives:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Video className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500">Nenhuma live encontrada no periodo selecionado</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Live</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Data</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  <span className="flex items-center justify-end gap-1"><Users className="w-3.5 h-3.5" /> Engajados</span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  <span className="flex items-center justify-end gap-1"><MessageCircle className="w-3.5 h-3.5" /> Comentarios</span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  <span className="flex items-center justify-end gap-1"><ShoppingCart className="w-3.5 h-3.5" /> Carrinho</span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  <span className="flex items-center justify-end gap-1"><Eye className="w-3.5 h-3.5" /> Espectadores</span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Duracao</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Pedidos</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Vendas</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">
                        {report.liveTitle || 'Live sem titulo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <div>{new Date(report.reportDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    {(() => { const d = new Date(report.reportDate); return (d.getHours() || d.getMinutes()) ? <div className="text-xs text-slate-400">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div> : null })()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{(report.engagedViewers || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{(report.totalComments || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{(report.addToCart || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{(report.totalViewers || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtTime(report.liveDuration)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{report.totalOrders || 0}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmtCurrency(report.totalRevenue)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit && onEdit(report)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                      title="Ver/Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Mostrar</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
              className="px-2 py-1 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            >
              {[10, 25, 50, 100].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500">por pagina</span>
            <span className="text-sm text-slate-400 ml-2">
              ({pagination.total} total)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 px-3">
              Pagina {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasMore}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
