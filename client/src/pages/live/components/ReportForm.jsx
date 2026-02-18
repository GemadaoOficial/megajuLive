import { useState } from 'react'
import { DollarSign, Users, Eye, ShoppingCart, Heart, MessageCircle, Share2, UserPlus, MousePointerClick, Timer, Target, Megaphone, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

function Section({ title, icon: Icon, gradient, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.06] transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// Formata numero para moeda brasileira (ex: 1213.62 -> "R$ 1.213,62")
function formatBRL(value) {
  if (!value && value !== 0) return ''
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Remove formatacao e retorna numero puro (ex: "R$ 1.213,62" -> 1213.62)
function parseBRL(str) {
  if (!str) return 0
  const clean = str.replace(/[R$\s.]/g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Formata numero com separador de milhar (ex: 10882 -> "10.882")
function formatNumber(value) {
  if (!value && value !== 0) return ''
  return Number(value).toLocaleString('pt-BR')
}

// Remove formatacao de numero (ex: "10.882" -> 10882)
function parseNumber(str) {
  if (!str) return 0
  const clean = str.replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Formata porcentagem (ex: 3.9 -> "3,90%")
function formatPct(value) {
  if (!value && value !== 0) return ''
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
}

function parsePct(str) {
  if (!str) return 0
  const clean = str.replace('%', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Formata segundos para HH:MM:SS (ex: 84 -> "00:01:24")
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return ''
  const s = Math.round(Number(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// Converte HH:MM:SS para segundos (ex: "00:01:24" -> 84)
function parseTime(str) {
  if (!str) return 0
  const parts = str.split(':').map(Number)
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0)
  if (parts.length === 2) return (parts[0] * 60) + (parts[1] || 0)
  return parseInt(str) || 0
}

function Field({ label, name, value, onChange, format, undetected }) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')

  const getDisplay = () => {
    if (focused) return raw
    if (format === 'currency') return (value || value === 0) ? formatBRL(value) : ''
    if (format === 'percent') return (value || value === 0) ? formatPct(value) : ''
    if (format === 'time') return formatTime(value)
    if (format === 'integer') return (value || value === 0) ? formatNumber(value) : ''
    return value ?? ''
  }

  const handleFocus = () => {
    setFocused(true)
    if (format === 'time') setRaw(formatTime(value))
    else setRaw(value ? String(value).replace('.', ',') : '')
  }

  const handleBlur = (e) => {
    setFocused(false)
    let parsed
    if (format === 'currency') parsed = parseBRL(raw)
    else if (format === 'percent') parsed = parsePct(raw)
    else if (format === 'time') parsed = parseTime(raw)
    else if (format === 'integer') parsed = Math.round(parseNumber(raw))
    else parsed = parseFloat(raw.replace(',', '.')) || 0
    onChange({ target: { name, value: parsed, type: 'number' } })
  }

  const handleChange = (e) => {
    setRaw(e.target.value)
  }

  const placeholder = format === 'currency' ? 'R$ 0,00' : format === 'percent' ? '0,00%' : format === 'time' ? '00:00:00' : '0'

  return (
    <div>
      <label className={`block text-xs font-medium mb-1 ${undetected ? 'text-amber-400' : 'text-slate-500'}`}>
        {label}
        {undetected && <span className="ml-1 text-amber-400" title="Nao detectado pela IA">*</span>}
      </label>
      <input
        type="text"
        inputMode={format === 'time' ? 'text' : 'decimal'}
        name={name}
        value={getDisplay()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={focused ? handleChange : onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-600 ${
          undetected ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/[0.08] bg-white/[0.05]'
        }`}
      />
    </div>
  )
}

function ProductField({ label, value, onChange, format }) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')

  const getDisplay = () => {
    if (focused) return raw
    if (format === 'currency') return (value || value === 0) ? formatBRL(value) : ''
    if (format === 'integer') return (value || value === 0) ? formatNumber(value) : ''
    return value ?? ''
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type={format ? 'text' : 'text'}
        inputMode={format ? 'decimal' : 'text'}
        value={getDisplay()}
        onFocus={() => { setFocused(true); setRaw(value ? String(value).replace('.', ',') : '') }}
        onBlur={() => {
          setFocused(false)
          let parsed
          if (format === 'currency') parsed = parseBRL(raw)
          else if (format === 'integer') parsed = Math.round(parseNumber(raw))
          else { onChange(raw); return }
          onChange(parsed)
        }}
        onChange={(e) => focused ? setRaw(e.target.value) : onChange(e.target.value)}
        placeholder={format === 'currency' ? 'R$ 0,00' : '0'}
        className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.05] text-white text-sm focus:outline-none focus:border-primary placeholder:text-slate-600"
      />
    </div>
  )
}

function ProductFields({ product, index, updateProduct }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
      <div className="col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
        <input type="text" value={product.name} onChange={(e) => updateProduct(index, 'name', e.target.value)} placeholder="Nome do produto" className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.05] text-white text-sm focus:outline-none focus:border-primary placeholder:text-slate-600" />
      </div>
      <ProductField label="Preco (R$)" value={product.price} onChange={(v) => updateProduct(index, 'price', v)} format="currency" />
      <ProductField label="Cliques" value={product.productClicks} onChange={(v) => updateProduct(index, 'productClicks', v)} format="integer" />
      <ProductField label="Pedidos" value={product.orders} onChange={(v) => updateProduct(index, 'orders', v)} format="integer" />
      <ProductField label="Vendidos" value={product.itemsSold} onChange={(v) => updateProduct(index, 'itemsSold', v)} format="integer" />
      <ProductField label="Add Carrinho" value={product.addToCart} onChange={(v) => updateProduct(index, 'addToCart', v)} format="integer" />
      <ProductField label="Vendas (R$)" value={product.revenue} onChange={(v) => updateProduct(index, 'revenue', v)} format="currency" />
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">ID Shopee</label>
        <input type="text" value={product.shopeeItemId || ''} onChange={(e) => updateProduct(index, 'shopeeItemId', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.05] text-white text-sm focus:outline-none focus:border-primary placeholder:text-slate-600" />
      </div>
    </div>
  )
}

const emptyProduct = { name: '', price: 0, productClicks: 0, clickRate: 0, orders: 0, itemsSold: 0, orderClickRate: 0, addToCart: 0, revenue: 0, shopeeItemId: '' }

export default function ReportForm({ data, onChange, products, onProductsChange, undetectedFields = [] }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target
    const newVal = type === 'number' ? parseFloat(value) || 0 : value
    // Auto-calcular coinsCost quando coinsUsed mudar (1 moeda = R$0,01)
    if (name === 'coinsUsed') {
      onChange({ ...data, [name]: newVal, coinsCost: parseFloat((newVal * 0.01).toFixed(2)) })
    } else {
      onChange({ ...data, [name]: newVal })
    }
  }

  const addProduct = () => {
    onProductsChange([...products, { ...emptyProduct }])
  }

  const removeProduct = (index) => {
    onProductsChange(products.filter((_, i) => i !== index))
  }

  const updateProduct = (index, field, value) => {
    const updated = [...products]
    updated[index] = { ...updated[index], [field]: typeof value === 'string' && field !== 'name' && field !== 'shopeeItemId' ? parseFloat(value) || 0 : value }
    onProductsChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Transação */}
      <Section title="Transação" icon={DollarSign} gradient="from-emerald-400 to-teal-500">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Field label="Vendas (R$)" name="totalRevenue" value={data.totalRevenue} onChange={handleChange} format="currency" undetected={undetectedFields.includes('totalRevenue')} />
          <Field label="Pedidos" name="totalOrders" value={data.totalOrders} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalOrders')} />
          <Field label="Itens Vendidos" name="totalItemsSold" value={data.totalItemsSold} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalItemsSold')} />
          <Field label="Vendas por Pedido (R$)" name="avgOrderValue" value={data.avgOrderValue} onChange={handleChange} format="currency" undetected={undetectedFields.includes('avgOrderValue')} />
          <Field label="Vendas por Comprador (R$)" name="avgRevenuePerBuyer" value={data.avgRevenuePerBuyer} onChange={handleChange} format="currency" undetected={undetectedFields.includes('avgRevenuePerBuyer')} />
        </div>
      </Section>

      {/* Tráfego */}
      <Section title="Tráfego" icon={Eye} gradient="from-violet-400 to-purple-500">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Field label="Espectadores" name="totalViewers" value={data.totalViewers} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalViewers')} />
          <Field label="Engajados" name="engagedViewers" value={data.engagedViewers} onChange={handleChange} format="integer" undetected={undetectedFields.includes('engagedViewers')} />
          <Field label="Visualizações" name="totalViews" value={data.totalViews} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalViews')} />
          <Field label="Pico Simultâneo" name="peakViewers" value={data.peakViewers} onChange={handleChange} format="integer" undetected={undetectedFields.includes('peakViewers')} />
          <Field label="Tempo Médio de Visualização" name="avgWatchTime" value={data.avgWatchTime} onChange={handleChange} format="time" undetected={undetectedFields.includes('avgWatchTime')} />
          <Field label="Duração da Live" name="liveDuration" value={data.liveDuration} onChange={handleChange} format="time" undetected={undetectedFields.includes('liveDuration')} />
        </div>
      </Section>

      {/* Conversão */}
      <Section title="Conversão" icon={Target} gradient="from-blue-400 to-indigo-500">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          <Field label="Taxa Cliques (%)" name="clickRate" value={data.clickRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('clickRate')} />
          <Field label="Compradores" name="totalBuyers" value={data.totalBuyers} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalBuyers')} />
          <Field label="Cliques Produto" name="productClicks" value={data.productClicks} onChange={handleChange} format="integer" undetected={undetectedFields.includes('productClicks')} />
          <Field label="Taxa Clique Prod. (%)" name="productClickRate" value={data.productClickRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('productClickRate')} />
          <Field label="Taxa Conversão (%)" name="conversionRate" value={data.conversionRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('conversionRate')} />
          <Field label="Add Carrinho" name="addToCart" value={data.addToCart} onChange={handleChange} format="integer" undetected={undetectedFields.includes('addToCart')} />
          <Field label="GPM (R$)" name="gpm" value={data.gpm} onChange={handleChange} format="currency" undetected={undetectedFields.includes('gpm')} />
        </div>
      </Section>

      {/* Engajamento */}
      <Section title="Engajamento" icon={Heart} gradient="from-pink-400 to-rose-500">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Field label="Curtidas" name="totalLikes" value={data.totalLikes} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalLikes')} />
          <Field label="Compartilhamentos" name="totalShares" value={data.totalShares} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalShares')} />
          <Field label="Comentários" name="totalComments" value={data.totalComments} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalComments')} />
          <Field label="Taxa Comentários (%)" name="commentRate" value={data.commentRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('commentRate')} />
          <Field label="Novos Seguidores" name="newFollowers" value={data.newFollowers} onChange={handleChange} format="integer" undetected={undetectedFields.includes('newFollowers')} />
        </div>
      </Section>

      {/* Marketing */}
      <Section title="Marketing / Promoção" icon={Megaphone} gradient="from-amber-400 to-orange-500">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label="Cupons Usados" name="couponsUsed" value={data.couponsUsed} onChange={handleChange} format="integer" undetected={undetectedFields.includes('couponsUsed')} />
          <Field label="Moedas Usadas (qtd)" name="coinsUsed" value={data.coinsUsed} onChange={handleChange} format="integer" undetected={undetectedFields.includes('coinsUsed')} />
          <div>
            <label className="block text-xs font-medium mb-1 text-emerald-400">Custo Moedas (R$)</label>
            <div className="w-full px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-400 font-medium">
              {data.coinsCost ? formatBRL(data.coinsCost) : 'R$ 0,00'}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">1 moeda = R$0,01</p>
          </div>
          <Field label="Qtd. Resgates" name="coinRedemptions" value={data.coinRedemptions} onChange={handleChange} format="integer" undetected={undetectedFields.includes('coinRedemptions')} />
          <Field label="Rodadas Leilão" name="auctionRounds" value={data.auctionRounds} onChange={handleChange} format="integer" undetected={undetectedFields.includes('auctionRounds')} />
        </div>
      </Section>

      {/* Funil de Tráfego */}
      <Section title="Funil de Tráfego" icon={MousePointerClick} gradient="from-cyan-400 to-blue-500" defaultOpen={false}>
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span>Impressão</span>
            <span>→</span>
            <span>Cliques</span>
            <span>→</span>
            <span>Pedidos</span>
            <span className="ml-auto text-white/20">Taxa geral: {data.impressionToOrderRate ? formatPct(data.impressionToOrderRate) : '—'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Field label="Impressões do Produto" name="productImpressions" value={data.productImpressions} onChange={handleChange} format="integer" undetected={undetectedFields.includes('productImpressions')} />
            <Field label="Taxa de Cliques (%)" name="clickRate" value={data.clickRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('clickRate')} />
            <Field label="Cliques de Produto" name="productClicks" value={data.productClicks} onChange={handleChange} format="integer" undetected={undetectedFields.includes('productClicks')} />
            <Field label="Taxa de Pedido (%)" name="orderRate" value={data.orderRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('orderRate')} />
            <Field label="Pedido Confirmado" name="totalOrders" value={data.totalOrders} onChange={handleChange} format="integer" undetected={undetectedFields.includes('totalOrders')} />
            <Field label="Taxa Impressão→Pedido (%)" name="impressionToOrderRate" value={data.impressionToOrderRate} onChange={handleChange} format="percent" undetected={undetectedFields.includes('impressionToOrderRate')} />
          </div>
        </div>
      </Section>

      {/* Produtos */}
      <Section title={`Produtos Apresentados (${products.length})`} icon={ShoppingCart} gradient="from-indigo-400 to-violet-500">
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={index} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Produto {index + 1}</span>
                <button type="button" onClick={() => removeProduct(index)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ProductFields product={product} index={index} updateProduct={updateProduct} />
            </div>
          ))}

          <button type="button" onClick={addProduct} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-white/[0.12] rounded-lg text-sm font-medium text-slate-400 hover:border-primary hover:text-primary transition-colors">
            <Plus className="w-4 h-4" /> Adicionar Produto
          </button>
        </div>
      </Section>
    </div>
  )
}
