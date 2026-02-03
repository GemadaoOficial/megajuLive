import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Package,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  GripVertical,
  Sparkles,
  ShoppingBag,
  Tag,
  CheckCircle,
} from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

export default function ProductPanel({
  products,
  setProducts,
  currentProductIndex,
  isRunning,
  onAddProduct,
  onRemoveProduct,
  onSelectProduct,
}) {
  const [showForm, setShowForm] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    timeSlot: 60,
  })

  const handleSubmit = () => {
    if (!productForm.name || !productForm.price) return

    onAddProduct({
      id: Date.now().toString(),
      name: productForm.name,
      price: parseFloat(productForm.price),
      timeSlot: productForm.timeSlot,
    })
    setProductForm({ name: '', price: '', timeSlot: 60 })
    setShowForm(false)
  }

  const quickTimeOptions = [30, 60, 90, 120, 180]

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-6 shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Produtos</h2>
            <p className="text-sm text-slate-500">{products.length} na fila</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            showForm
              ? 'bg-slate-200 text-slate-600 rotate-45'
              : 'bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg'
          }`}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Add Product Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Novo Produto
              </div>

              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  placeholder="Nome do produto"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    placeholder="Preco"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    placeholder="Tempo (seg)"
                    value={productForm.timeSlot}
                    onChange={(e) =>
                      setProductForm({ ...productForm, timeSlot: parseInt(e.target.value) || 60 })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Quick Time Selection */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Tempo rapido:</p>
                <div className="flex gap-2">
                  {quickTimeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => setProductForm({ ...productForm, timeSlot: time })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        productForm.timeSlot === time
                          ? 'bg-primary text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-primary'
                      }`}
                    >
                      {time}s
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/30 transition-shadow"
              >
                <Plus className="w-5 h-5" />
                Adicionar Produto
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum produto na fila</p>
            <p className="text-sm text-slate-400 mt-1">Adicione produtos para comecar</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {products.map((product, index) => {
              const isActive = currentProductIndex === index
              const isPast = currentProductIndex > index

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => isRunning && onSelectProduct(index)}
                  className={`
                    group relative flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer
                    ${isActive
                      ? 'bg-gradient-to-r from-primary/10 to-orange-500/10 border-2 border-primary shadow-lg scale-[1.02]'
                      : isPast
                        ? 'bg-emerald-50 border-2 border-emerald-200 opacity-70'
                        : 'bg-white border-2 border-slate-100 hover:border-slate-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Drag Handle */}
                  <div className="text-slate-300 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Index Badge */}
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0
                    ${isActive
                      ? 'bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg'
                      : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }
                  `}>
                    {isPast ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${
                      isActive ? 'text-primary' : isPast ? 'text-emerald-700' : 'text-slate-800'
                    }`}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-sm">
                        <Tag className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 font-medium">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-3 h-3" />
                        {product.timeSlot}s
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                  )}

                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveProduct(product.id)
                    }}
                    className="p-2 rounded-xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Quick Stats */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 pt-4 border-t border-slate-200"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500">Total estimado</p>
              <p className="text-lg font-bold text-slate-800">
                R$ {products.reduce((acc, p) => acc + p.price, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500">Tempo total</p>
              <p className="text-lg font-bold text-slate-800">
                {Math.floor(products.reduce((acc, p) => acc + p.timeSlot, 0) / 60)}min
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  )
}
