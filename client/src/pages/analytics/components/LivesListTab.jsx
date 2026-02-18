import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Video, Eye, MessageCircle, ShoppingCart, Users, DollarSign, ChevronLeft, ChevronRight, Edit, Clock, TrendingUp, Coins, Store } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

const STORE_LABEL = {
  MADA:        { label: 'Mada',        cls: 'bg-orange-500/20 text-orange-400' },
  STAR_IMPORT: { label: 'Star Import', cls: 'bg-violet-500/20 text-violet-400' },
}

const fmt = (n) => (n == null ? '0' : n.toLocaleString('pt-BR'))

const fmtCurrency = (n) => `R$ ${(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtTime = (seconds) => {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`
  return `${m}min`
}

export default function LivesListTab({ period, startDate, endDate, store, onEdit }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadReports()
  }, [page, limit, period, startDate, endDate, store])

  useEffect(() => {
    setPage(1)
  }, [period, startDate, endDate, store])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await liveReportsAPI.getAll({
        page, limit, period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
        ...(store && { store }),
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
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
          <Video className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-lg font-semibold text-slate-400">Nenhuma live encontrada</p>
        <p className="text-sm text-slate-500 mt-1">Nao ha relatorios no periodo selecionado</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Table */}
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                <th className="text-left px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Live</th>
                <th className="text-left px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Loja</th>
                <th className="text-left px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Data</th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><Users className="w-3.5 h-3.5 text-violet-400" /> Engajados</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Comentarios</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-orange-400" /> Carrinho</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><Eye className="w-3.5 h-3.5 text-purple-400" /> Viewers</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duracao</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Pedidos</th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><Coins className="w-3.5 h-3.5 text-yellow-500" /> Moedas</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Vendas</th>
                <th className="text-center px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {reports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-white/[0.03] transition-all group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-200/50 group-hover:shadow-md group-hover:shadow-orange-200/50 transition-shadow">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-white truncate max-w-[200px] group-hover:text-primary transition-colors">
                        {report.liveTitle || 'Live sem titulo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {(() => {
                      const info = STORE_LABEL[report.store] || { label: report.store || '—', cls: 'bg-white/[0.05] text-slate-400' }
                      return (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.cls}`}>
                          {info.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-slate-200 font-medium">{new Date(report.reportDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    {(() => { const d = new Date(report.reportDate); return (d.getHours() || d.getMinutes()) ? <div className="text-xs text-slate-500 mt-0.5">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div> : null })()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(report.engagedViewers || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(report.totalComments || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(report.addToCart || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(report.totalViewers || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-slate-400 font-mono text-xs">{fmtTime(report.liveDuration)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-bold text-xs">{report.totalOrders || 0}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {report.coinsUsed > 0 ? (
                      <div>
                        <span className="font-semibold text-yellow-400">{fmt(report.coinsUsed)}</span>
                        <div className="text-xs text-slate-500">{fmtCurrency((report.coinsUsed || 0) * 0.01)}</div>
                      </div>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-emerald-400">{fmtCurrency(report.totalRevenue)}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onEdit && onEdit(report)}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-primary/10 text-slate-500 hover:text-primary transition-all"
                      title="Ver/Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between bg-white/[0.05] border border-white/[0.08] rounded-2xl px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Mostrar</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
              className="px-3 py-1.5 rounded-xl border border-white/[0.1] text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white/[0.05] text-white"
            >
              {[10, 25, 50, 100].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500">
              de <span className="font-semibold text-slate-300">{pagination.total}</span> relatorios
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                      page === pageNum
                        ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {pagination.totalPages > 5 && (
                <span className="px-1 text-slate-500">...</span>
              )}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasMore}
              className="p-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
