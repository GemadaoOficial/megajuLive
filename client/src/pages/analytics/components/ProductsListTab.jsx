import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, ChevronLeft, ChevronRight, ShoppingCart, MousePointerClick, DollarSign, TrendingUp } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

const fmtCurrency = (n) => `R$ ${(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ProductsListTab({ period, startDate, endDate, store }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [page, limit, period, startDate, endDate, store])

  useEffect(() => {
    setPage(1)
  }, [period, startDate, endDate, store])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await liveReportsAPI.getProducts({
        page, limit, period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
        ...(store && { store }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary Bar */}
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Produtos</p>
            <p className="font-bold text-white">{pagination?.total || 0}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Cliques</p>
            <p className="font-bold text-white">{totals.clicks.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pedidos</p>
            <p className="font-bold text-white">{totals.orders.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">GMV Total</p>
            <p className="font-bold text-emerald-400">{fmtCurrency(totals.revenue)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                <th className="text-left px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Produto</th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><MousePointerClick className="w-3.5 h-3.5 text-blue-400" /> Cliques</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-orange-400" /> Carrinho</span>
                </th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Pedidos</th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Vendidos</th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">GMV</th>
                <th className="text-right px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Lives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {products.map((product, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-white/[0.03] transition-all group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200/50 group-hover:shadow-md transition-shadow">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors" title={product.name}>
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(product.productClicks || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(product.addToCart || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-bold text-xs">{(product.orders || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-slate-200">{(product.itemsSold || 0).toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-emerald-400">{fmtCurrency(product.revenue)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 font-semibold text-xs">{product.appearances}x</span>
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
              de <span className="font-semibold text-slate-300">{pagination.total}</span> produtos
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
