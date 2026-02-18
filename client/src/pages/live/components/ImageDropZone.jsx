import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, Upload, X, BarChart3, Package, TrendingUp, Clipboard, FolderOpen } from 'lucide-react'

const categoryConfig = {
  stats: {
    icon: BarChart3,
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-500/15',
    lightBorder: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500',
    ringColor: 'ring-blue-500/30',
  },
  products: {
    icon: Package,
    color: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-500/15',
    lightBorder: 'border-violet-500/30',
    hoverBorder: 'hover:border-violet-500/50',
    activeBorder: 'border-violet-500',
    activeBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    badgeBg: 'bg-violet-500',
    ringColor: 'ring-violet-500/30',
  },
  traffic: {
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-500/15',
    lightBorder: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500',
    ringColor: 'ring-emerald-500/30',
  },
}

export default function ImageDropZone({ onDrop, files, setFiles, label, max, disabled, category = 'stats' }) {
  const config = categoryConfig[category] || categoryConfig.stats
  const CategoryIcon = config.icon
  const pasteRef = useRef(null)
  const [pasteFocused, setPasteFocused] = useState(false)

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: max,
    disabled,
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted) => onDrop(accepted),
  })

  const handlePaste = useCallback((e) => {
    if (disabled) return
    const items = e.clipboardData?.items
    if (!items) return
    const imageFiles = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault()
      onDrop(imageFiles)
    }
  }, [disabled, onDrop])

  const focusPasteArea = () => {
    if (pasteRef.current) {
      pasteRef.current.focus()
    }
  }

  const hasFiles = files.length > 0

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center`}>
            <CategoryIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-200">{label}</span>
        </div>
        {hasFiles && (
          <span className={`${config.badgeBg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
            {files.length}/{max}
          </span>
        )}
      </div>

      {/* Drop Zone (drag only, no click) */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden ${
          isDragActive
            ? `${config.activeBorder} ${config.activeBg} scale-[1.02] shadow-md`
            : hasFiles
              ? `${config.lightBorder} ${config.lightBg} ${config.hoverBorder}`
              : `border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.03]`
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        {hasFiles ? (
          /* Thumbnail Grid */
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              <AnimatePresence>
                {files.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden border border-white/50 shadow-sm group"
                  >
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)) }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add more slot */}
              {files.length < max && (
                <div
                  onClick={open}
                  className={`aspect-square rounded-xl border-2 border-dashed ${config.lightBorder} flex flex-col items-center justify-center gap-1 ${config.lightBg} cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <Upload className={`w-4 h-4 ${config.iconColor}`} />
                  <span className={`text-[10px] font-medium ${config.iconColor}`}>Adicionar</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-6 px-4 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-2xl ${config.lightBg} flex items-center justify-center mb-1`}>
              <ImageIcon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <p className="text-sm font-medium text-slate-300">
              {isDragActive ? 'Solte as imagens aqui' : 'Arraste imagens aqui'}
            </p>
            <p className="text-xs text-slate-500">ou use os botoes abaixo</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-2">
        {/* File picker button */}
        <button
          type="button"
          onClick={open}
          disabled={disabled || files.length >= max}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/[0.08] text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Selecionar
        </button>

        {/* Paste area - click to focus, then CTRL+V */}
        <div
          ref={pasteRef}
          tabIndex={0}
          onPaste={handlePaste}
          onFocus={() => setPasteFocused(true)}
          onBlur={() => setPasteFocused(false)}
          onClick={focusPasteArea}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none outline-none ${
            pasteFocused
              ? `${config.activeBorder} ${config.activeBg} ${config.iconColor} ring-2 ${config.ringColor}`
              : `border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.12]`
          } ${disabled || files.length >= max ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          {pasteFocused ? 'Cole agora (Ctrl+V)' : 'Colar'}
        </div>
      </div>
    </div>
  )
}
