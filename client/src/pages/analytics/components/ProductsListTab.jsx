import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, ChevronLeft, ChevronRight, ShoppingCart, MousePointerClick } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

const fmtCurrency = (n) => `R$ ${(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ProductsListTab({ period, startDate, endDate }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [page, limit, period, startDate, endDate])

  useEffect(() => {
    setPage(1)
  }, [period, startDate, endDate])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await liveReportsAPI.getProducts({
        page, limit, period,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
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
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500">Nenhum produto encontrado no periodo selecionado</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Package className="w-4 h-4" />
        {pagination?.total || 0} produto{(pagination?.total || 0) !== 1 ? 's' : ''} no periodo
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Produto</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  <span className="flex items-center justify-end gap-1"><MousePointerClick className="w-3.5 h-3.5" /> Cliques</span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  <span className="flex items-center justify-end gap-1"><ShoppingCart className="w-3.5 h-3.5" /> Carrinho</span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Pedidos</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Vendidos</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">GMV</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs">Aparicoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-800 truncate max-w-[250px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {(product.productClicks || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {(product.addToCart || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {(product.orders || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {(product.itemsSold || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {fmtCurrency(product.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400">
                    {product.appearances}x
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
            <span className="text-sm text-slate-400 ml-2">({pagination.total} total)</span>
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
