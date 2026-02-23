import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ShoppingCart, MousePointerClick, DollarSign, Sparkles, Loader2, Undo2, ArrowRight, Search, ArrowUpDown, Trophy, Medal, Award } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

const fmtCurrency = (n) => `R$ ${(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtNumber = (n) => (n || 0).toLocaleString('pt-BR')
const fmtPercent = (n) => `${(n || 0).toFixed(1)}%`

// Rank badge for top 3
function RankBadge({ rank }) {
  if (rank === 1) return <div className="w-6 h-6 rounded-full bg-linear-to-r from-yellow-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30"><Trophy className="w-3 h-3 text-white" /></div>
  if (rank === 2) return <div className="w-6 h-6 rounded-full bg-linear-to-r from-slate-300 to-slate-400 flex items-center justify-center shrink-0"><Medal className="w-3 h-3 text-white" /></div>
  if (rank === 3) return <div className="w-6 h-6 rounded-full bg-linear-to-r from-amber-600 to-amber-700 flex items-center justify-center shrink-0"><Award className="w-3 h-3 text-white" /></div>
  return <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-slate-500">{rank}</span></div>
}

export default function ProductsListTab({ period, startDate, endDate, store }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiGrouped, setAiGrouped] = useState(false)
  const [dedupResult, setDedupResult] = useState(null)
  const [showDedupDetails, setShowDedupDetails] = useState(false)
  const [undoing, setUndoing] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)
  const [sortBy, setSortBy] = useState('revenue')
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const filterParams = {
    period,
    startDate: period === 'custom' ? startDate : undefined,
    endDate: period === 'custom' ? endDate : undefined,
    ...(store && { store }),
  }

  useEffect(() => {
    loadProducts()
  }, [page, limit, period, startDate, endDate, store, sortBy, sortDir, search])

  useEffect(() => {
    setPage(1)
    setAiGrouped(false)
    setDedupResult(null)
  }, [period, startDate, endDate, store])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput)
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await liveReportsAPI.getProducts({
        page, limit, ...filterParams, sortBy, sortDir,
        ...(search && { search }),
      })
      setProducts(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProducts([])
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
    setPage(1)
  }

  const handleAiDedup = async () => {
    if (products.length === 0 || aiLoading) return
    setAiLoading(true)
    try {
      const response = await liveReportsAPI.aiDedup(filterParams)
      setAiGrouped(true)
      setDedupResult(response.data)
      setShowDedupDetails(false)
      setPage(1)
      await loadProducts()
    } catch (error) {
      console.error('Erro AI dedup:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleUndo = async () => {
    if (undoing) return
    setUndoing(true)
    try {
      await liveReportsAPI.undoDedup(filterParams)
      setAiGrouped(false)
      setDedupResult(null)
      setShowDedupDetails(false)
      setPage(1)
      await loadProducts()
    } catch (error) {
      console.error('Erro ao desfazer:', error)
    } finally {
      setUndoing(false)
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (products.length === 0 && !search) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-lg font-semibold text-slate-400">Nenhum produto encontrado</p>
        <p className="text-sm text-slate-500 mt-1">Nao ha produtos registrados no periodo selecionado</p>
      </div>
    )
  }

  // Calculate totals for the summary bar
  const totals = products.reduce((acc, p) => ({
    clicks: acc.clicks + (p.productClicks || 0),
    orders: acc.orders + (p.orders || 0),
    revenue: acc.revenue + (p.revenue || 0),
  }), { clicks: 0, orders: 0, revenue: 0 })

  // Max revenue for inline bar chart
  const maxRevenue = Math.max(...products.map(p => p.revenue || 0), 1)

  const mergedGroups = dedupResult?.mergedGroups?.filter(g => g.count > 1) || []
  const totalMergedNames = mergedGroups.reduce((s, g) => s + g.count, 0)

  // Rank is based on current page position + offset
  const rankOffset = (page - 1) * limit

  // Sort indicator for column headers
  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover/th:opacity-100 transition-opacity" />
    return sortDir === 'desc'
      ? <ChevronDown className="w-3 h-3 text-primary" />
      : <ChevronUp className="w-3 h-3 text-primary" />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary Bar */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center gap-6 flex-wrap justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Produtos</p>
            <p className="font-bold text-white">{pagination?.total || 0}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/8" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Cliques</p>
            <p className="font-bold text-white">{totals.clicks.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/8" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pedidos</p>
            <p className="font-bold text-white">{totals.orders.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/8" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">GMV Total</p>
            <p className="font-bold text-emerald-400">{fmtCurrency(totals.revenue)}</p>
          </div>
        </div>
        <button
          onClick={handleAiDedup}
          disabled={aiLoading || aiGrouped}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            aiGrouped
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default'
              : 'bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20'
          } disabled:opacity-60`}
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {aiGrouped ? 'Agrupado com IA' : aiLoading ? 'Agrupando...' : 'Agrupar com IA'}
        </button>
      </div>

      {/* Dedup Result Banner */}
      <AnimatePresence>
        {dedupResult && mergedGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-violet-500/8 border border-violet-500/20 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Agrupado com IA</p>
                  <p className="text-xs text-slate-400">
                    {dedupResult.totalOriginal} nomes <ArrowRight className="w-3 h-3 inline" /> {dedupResult.totalGroups} produtos
                    <span className="text-violet-400 ml-1">({totalMergedNames} mesclados em {mergedGroups.length} grupos)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDedupDetails(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/6 transition-all border border-white/8"
                >
                  {showDedupDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showDedupDetails ? 'Ocultar' : 'Ver detalhes'}
                </button>
                <button
                  onClick={handleUndo}
                  disabled={undoing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                >
                  {undoing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                  {undoing ? 'Desfazendo...' : 'Desfazer'}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {showDedupDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 space-y-2 border-t border-violet-500/10 pt-3">
                    {mergedGroups.map((group, i) => (
                      <div key={i} className="bg-white/4 rounded-xl p-3 border border-white/6">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-sm font-semibold text-white">{group.canonicalName}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">{group.count} nomes</span>
                        </div>
                        <div className="pl-5 space-y-1">
                          {group.mergedNames.map((name, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs">
                              <span className={name === group.canonicalName ? 'text-emerald-400' : 'text-slate-500'}>
                                {name === group.canonicalName ? '=' : '<-'}
                              </span>
                              <span className={name === group.canonicalName ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                                {name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar produto por nome..."
          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setSearch('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors text-xs"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/3 border-b border-white/6">
                <th className="text-left px-5 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider w-8">#</th>
                <th
                  onClick={() => handleSort('name')}
                  className="text-left px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">Produto <SortIcon field="name" /></span>
                </th>
                <th
                  onClick={() => handleSort('productClicks')}
                  className="text-right px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center justify-end gap-1.5"><MousePointerClick className="w-3.5 h-3.5 text-blue-400" /> Cliques <SortIcon field="productClicks" /></span>
                </th>
                <th
                  onClick={() => handleSort('addToCart')}
                  className="text-right px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center justify-end gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-orange-400" /> Carrinho <SortIcon field="addToCart" /></span>
                </th>
                <th
                  onClick={() => handleSort('orders')}
                  className="text-right px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center justify-end gap-1.5">Pedidos <SortIcon field="orders" /></span>
                </th>
                <th className="text-right px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1">Conv.</span>
                </th>
                <th
                  onClick={() => handleSort('revenue')}
                  className="text-right px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center justify-end gap-1.5">GMV <SortIcon field="revenue" /></span>
                </th>
                <th
                  onClick={() => handleSort('appearances')}
                  className="text-right px-3 py-3.5 font-bold text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center justify-end gap-1.5">Lives <SortIcon field="appearances" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {products.length === 0 && search ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Nenhum produto encontrado para "<span className="text-white">{search}</span>"</p>
                  </td>
                </tr>
              ) : products.map((product, index) => {
                const rank = rankOffset + index + 1
                const convRate = product.productClicks > 0 ? (product.orders / product.productClicks * 100) : 0
                const ticketMedio = product.itemsSold > 0 ? product.revenue / product.itemsSold : 0
                const revenueBar = (product.revenue / maxRevenue) * 100

                return (
                  <motion.tr
                    key={`${product.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`hover:bg-white/3 transition-all group ${rank <= 3 ? 'bg-white/[0.02]' : ''}`}
                  >
                    {/* Rank */}
                    <td className="pl-5 pr-1 py-3.5">
                      <RankBadge rank={rank} />
                    </td>
                    {/* Product Name */}
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col">
                        <span className={`font-semibold group-hover:text-indigo-400 transition-colors ${rank <= 3 ? 'text-white' : 'text-slate-200'}`} title={product.name}>
                          {product.name}
                        </span>
                        {ticketMedio > 0 && (
                          <span className="text-[10px] text-slate-500 mt-0.5">Ticket medio: {fmtCurrency(ticketMedio)}</span>
                        )}
                      </div>
                    </td>
                    {/* Clicks */}
                    <td className="px-3 py-3.5 text-right">
                      <span className="font-semibold text-slate-200">{fmtNumber(product.productClicks)}</span>
                    </td>
                    {/* Cart */}
                    <td className="px-3 py-3.5 text-right">
                      <span className="font-semibold text-slate-200">{fmtNumber(product.addToCart)}</span>
                    </td>
                    {/* Orders */}
                    <td className="px-3 py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                        product.orders > 0 ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-slate-500'
                      }`}>{fmtNumber(product.orders)}</span>
                    </td>
                    {/* Conversion Rate */}
                    <td className="px-3 py-3.5 text-right">
                      <span className={`text-xs font-semibold ${
                        convRate >= 5 ? 'text-emerald-400' : convRate >= 2 ? 'text-amber-400' : convRate > 0 ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {convRate > 0 ? fmtPercent(convRate) : '-'}
                      </span>
                    </td>
                    {/* Revenue with inline bar */}
                    <td className="px-3 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-bold ${product.revenue > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {fmtCurrency(product.revenue)}
                        </span>
                        {product.revenue > 0 && (
                          <div className="w-20 h-1 bg-white/6 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500/50 rounded-full"
                              style={{ width: `${revenueBar}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Lives */}
                    <td className="px-3 py-3.5 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-semibold text-xs">{product.appearances}x</span>
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
              de <span className="font-semibold text-slate-300">{pagination.total}</span> produtos
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
    </motion.div>
  )
}
