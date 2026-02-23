import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Eye, MessageCircle, ShoppingCart, Users, DollarSign, ChevronLeft, ChevronRight,
  Edit, Clock, TrendingUp, Coins, Search, ArrowUpDown, ChevronDown, ChevronUp,
  Trophy, Medal, Award, X
} from 'lucide-react'
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

// ─── Rank Badge ────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return <div className="w-7 h-7 rounded-lg bg-linear-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm"><Trophy className="w-3.5 h-3.5 text-white" /></div>
  if (rank === 2) return <div className="w-7 h-7 rounded-lg bg-linear-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-sm"><Medal className="w-3.5 h-3.5 text-white" /></div>
  if (rank === 3) return <div className="w-7 h-7 rounded-lg bg-linear-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm"><Award className="w-3.5 h-3.5 text-white" /></div>
  return <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><span className="text-xs text-slate-500 font-bold">{rank}</span></div>
}

// ─── Sort Icon ─────────────────────────────────────────────────
function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy === field) {
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
  }
  return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
}

export default function LivesListTab({ period, startDate, endDate, store, onEdit }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)
  const [sortBy, setSortBy] = useState('reportDate')
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    loadReports()
  }, [page, limit, period, startDate, endDate, store, sortBy, sortDir, search])

  useEffect(() => {
    setPage(1)
  }, [period, startDate, endDate, store, search])

  // Search debounce
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await liveReportsAPI.getAll({
        page, limit, period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
        ...(store && { store }),
        sortBy,
        sortOrder: sortDir,
        ...(search && { search }),
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const maxRevenue = reports.length > 0 ? Math.max(...reports.map(r => r.totalRevenue || 0)) : 1

  // Compute rank based on revenue (descending)
  const revenueRanked = [...reports].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
  const rankMap = new Map()
  revenueRanked.forEach((r, i) => rankMap.set(r.id, i + 1 + (page - 1) * limit))

  // Summary stats
  const totalRevenue = reports.reduce((s, r) => s + (r.totalRevenue || 0), 0)
  const totalOrders = reports.reduce((s, r) => s + (r.totalOrders || 0), 0)
  const avgViewers = reports.length > 0 ? Math.round(reports.reduce((s, r) => s + (r.totalViewers || 0), 0) / reports.length) : 0

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const SortableHeader = ({ field, children, align = 'right' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`${align === 'left' ? 'text-left' : 'text-right'} px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group hover:text-slate-200 transition-colors`}
    >
      <span className={`flex items-center ${align === 'right' ? 'justify-end' : ''} gap-1`}>
        {children}
        <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />
      </span>
    </th>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary + Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{pagination?.total || reports.length}</p>
            <p className="text-[10px] text-slate-500 uppercase">Lives</p>
          </div>
          <div className="w-px h-8 bg-white/8" />
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{fmtCurrency(totalRevenue)}</p>
            <p className="text-[10px] text-slate-500 uppercase">Revenue (pagina)</p>
          </div>
          <div className="w-px h-8 bg-white/8" />
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">{totalOrders}</p>
            <p className="text-[10px] text-slate-500 uppercase">Pedidos</p>
          </div>
          <div className="w-px h-8 bg-white/8" />
          <div className="text-center">
            <p className="text-lg font-bold text-purple-400">{fmt(avgViewers)}</p>
            <p className="text-[10px] text-slate-500 uppercase">Media Viewers</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por titulo..."
            className="pl-9 pr-8 py-2 w-64 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch('') }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {reports.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-lg font-semibold text-slate-400">
            {search ? `Nenhuma live encontrada para "${search}"` : 'Nenhuma live encontrada'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {search ? 'Tente outro termo de busca' : 'Nao ha relatorios no periodo selecionado'}
          </p>
          {search && (
            <button onClick={() => { setSearchInput(''); setSearch('') }} className="mt-3 text-sm text-primary hover:underline">Limpar busca</button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/3 border-b border-white/6">
                    <th className="text-center px-3 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider w-10">#</th>
                    <th className="text-left px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Live</th>
                    <th className="text-left px-3 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Loja</th>
                    <SortableHeader field="reportDate" align="left">Data</SortableHeader>
                    <SortableHeader field="totalViewers">
                      <Eye className="w-3.5 h-3.5 text-purple-400" /> Viewers
                    </SortableHeader>
                    <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                      <span className="flex items-center justify-end gap-1">Engaj.%</span>
                    </th>
                    <SortableHeader field="totalComments">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Coment.
                    </SortableHeader>
                    <SortableHeader field="addToCart">
                      <ShoppingCart className="w-3.5 h-3.5 text-orange-400" /> Carrinho
                    </SortableHeader>
                    <SortableHeader field="totalOrders">Pedidos</SortableHeader>
                    <SortableHeader field="coinsUsed">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" /> Moedas
                    </SortableHeader>
                    <SortableHeader field="totalRevenue">Vendas</SortableHeader>
                    <th className="text-center px-3 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {reports.map((report, index) => {
                    const engRate = report.totalViewers > 0
                      ? ((report.engagedViewers || 0) / report.totalViewers * 100)
                      : 0
                    const rank = rankMap.get(report.id) || index + 1
                    const revPct = maxRevenue > 0 ? ((report.totalRevenue || 0) / maxRevenue * 100) : 0

                    return (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-white/3 transition-all group"
                      >
                        {/* Rank */}
                        <td className="px-3 py-3 text-center">
                          <RankBadge rank={rank} />
                        </td>

                        {/* Title + duration */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-r from-primary to-orange-500 flex items-center justify-center shrink-0 shadow-xs shadow-orange-200/50 group-hover:shadow-md transition-shadow">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-white truncate block max-w-[180px] group-hover:text-primary transition-colors">
                                {report.liveTitle || 'Live sem titulo'}
                              </span>
                              {report.liveDuration > 0 && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {fmtTime(report.liveDuration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Store */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {(() => {
                            const info = STORE_LABEL[report.store] || { label: report.store || '—', cls: 'bg-white/5 text-slate-400' }
                            return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.cls}`}>{info.label}</span>
                          })()}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-slate-200 font-medium text-xs">{new Date(report.reportDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          {(() => { const d = new Date(report.reportDate); return (d.getHours() || d.getMinutes()) ? <div className="text-[10px] text-slate-500 mt-0.5">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div> : null })()}
                        </td>

                        {/* Viewers */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-slate-200">{fmt(report.totalViewers)}</span>
                        </td>

                        {/* Engagement Rate */}
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-bold ${engRate >= 25 ? 'text-emerald-400' : engRate >= 15 ? 'text-amber-400' : 'text-slate-500'}`}>
                            {engRate > 0 ? `${engRate.toFixed(1)}%` : '-'}
                          </span>
                        </td>

                        {/* Comments */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-slate-200">{fmt(report.totalComments)}</span>
                        </td>

                        {/* Cart */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-slate-200">{fmt(report.addToCart)}</span>
                        </td>

                        {/* Orders */}
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                            (report.totalOrders || 0) > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500'
                          }`}>
                            {report.totalOrders || 0}
                          </span>
                        </td>

                        {/* Coins */}
                        <td className="px-4 py-3 text-right">
                          {report.coinsUsed > 0 ? (
                            <div>
                              <span className="font-semibold text-yellow-400 text-xs">{fmt(report.coinsUsed)}</span>
                              <div className="text-[10px] text-slate-500">{fmtCurrency((report.coinsUsed || 0) * 0.01)}</div>
                            </div>
                          ) : (
                            <span className="text-white/15">—</span>
                          )}
                        </td>

                        {/* Revenue with inline bar */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-emerald-400 text-xs">{fmtCurrency(report.totalRevenue)}</span>
                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500/60 rounded-full transition-all"
                                style={{ width: `${revPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => onEdit && onEdit(report)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/10 text-slate-500 hover:text-primary transition-all"
                            title="Ver/Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between bg-white/5 border border-white/8 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Mostrar</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white/5 text-white"
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
                  className="p-2 rounded-xl border border-white/8 hover:bg-white/6 hover:border-white/12 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                            ? 'bg-linear-to-r from-primary to-orange-500 text-white shadow-xs'
                            : 'text-slate-400 hover:bg-white/6'
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
                  className="p-2 rounded-xl border border-white/8 hover:bg-white/6 hover:border-white/12 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
