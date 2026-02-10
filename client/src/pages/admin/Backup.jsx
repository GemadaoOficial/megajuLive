import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HardDrive, Download, Trash2, Loader2, CheckCircle,
  AlertCircle, Database, FolderArchive, Clock, FileArchive,
  Shield, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../services/api'

export default function Backup() {
  const [status, setStatus] = useState('idle') // 'idle' | 'generating' | 'complete' | 'error'
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [progressStep, setProgressStep] = useState('')
  const [result, setResult] = useState(null) // { filename, size, sizeMB, records }
  const [backups, setBackups] = useState([])
  const [loadingBackups, setLoadingBackups] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { loadBackups() }, [])

  const loadBackups = async () => {
    try {
      const res = await api.get('/admin/backup/list')
      setBackups(res.data.backups || [])
    } catch (e) {
      console.error('Erro ao carregar backups:', e)
    } finally {
      setLoadingBackups(false)
    }
  }

  const generateBackup = async () => {
    setStatus('generating')
    setProgress(0)
    setProgressMessage('Iniciando...')
    setResult(null)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/backup/generate', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              setProgress(data.progress)
              setProgressMessage(data.message)
              setProgressStep(data.step)

              if (data.step === 'complete') {
                setResult({
                  filename: data.filename,
                  size: data.size,
                  sizeMB: data.sizeMB,
                  records: data.records,
                })
                setStatus('complete')
                loadBackups()
                toast.success('Backup gerado com sucesso!')
              } else if (data.step === 'error') {
                setStatus('error')
                toast.error('Erro ao gerar backup')
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Backup error:', error)
      setStatus('error')
      toast.error('Erro ao gerar backup')
    }
  }

  const downloadBackup = (filename) => {
    const token = localStorage.getItem('accessToken')
    const link = document.createElement('a')
    link.download = filename

    fetch(`/api/admin/backup/download/${filename}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
  }

  const deleteBackup = async (filename) => {
    if (!confirm('Deseja realmente excluir este backup?')) return
    setDeletingId(filename)
    try {
      await api.delete(`/admin/backup/${filename}`)
      toast.success('Backup excluido')
      loadBackups()
    } catch {
      toast.error('Erro ao excluir backup')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
            <HardDrive className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Backup do Sistema</h1>
            <p className="text-slate-500">Exporte e gerencie backups completos do banco de dados e arquivos</p>
          </div>
        </div>
      </motion.div>

      {/* Main Backup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Card Header with gradient accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#EE4D2D] via-orange-400 to-amber-400" />

        <div className="p-8">
          {/* Status: IDLE */}
          {status === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <FolderArchive className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Gerar Novo Backup</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Exporta todos os dados do banco de dados e arquivos de upload em um arquivo ZIP compactado
              </p>
              <div className="flex items-center justify-center gap-6 mb-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-500" />
                  <span>Banco de Dados</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-blue-500" />
                  <span>Uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-emerald-500" />
                  <span>Formato ZIP</span>
                </div>
              </div>
              <button
                onClick={generateBackup}
                className="px-8 py-4 bg-gradient-to-r from-[#EE4D2D] to-orange-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <HardDrive className="w-5 h-5" />
                Gerar Backup Completo
              </button>
            </motion.div>
          )}

          {/* Status: GENERATING */}
          {status === 'generating' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <RefreshCw className="w-16 h-16 text-[#EE4D2D]" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-700 mb-1">Gerando Backup...</h2>
                <p className="text-slate-500">{progressMessage}</p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-lg mx-auto">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>{progressStep === 'database' ? 'Banco de dados' : progressStep === 'uploads' ? 'Uploads' : progressStep === 'finalizing' ? 'Finalizando' : 'Preparando'}</span>
                  <span className="font-bold text-slate-700">{Math.round(progress)}%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#EE4D2D] via-orange-400 to-amber-400 rounded-full relative"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                  </motion.div>
                </div>

                {/* Step indicators */}
                <div className="flex justify-between mt-4 px-1">
                  {[
                    { key: 'init', label: 'Inicio', icon: Shield },
                    { key: 'database', label: 'Banco', icon: Database },
                    { key: 'uploads', label: 'Uploads', icon: FolderArchive },
                    { key: 'finalizing', label: 'ZIP', icon: FileArchive },
                  ].map((s, i) => {
                    const isActive = s.key === progressStep
                    const isDone = progress > [5, 50, 80, 95][i]
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isDone ? 'bg-emerald-100 text-emerald-600' :
                          isActive ? 'bg-[#EE4D2D]/10 text-[#EE4D2D]' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {isDone ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs ${isDone ? 'text-emerald-600' : isActive ? 'text-[#EE4D2D] font-semibold' : 'text-slate-400'}`}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Status: COMPLETE */}
          {status === 'complete' && result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Backup Concluido!</h2>
              <p className="text-slate-500 mb-6">Seu backup foi gerado com sucesso</p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{result.sizeMB}</p>
                  <p className="text-xs text-slate-500">Tamanho</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{result.records?.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-slate-500">Registros</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => downloadBackup(result.filename)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Baixar Backup
                </button>
                <button
                  onClick={() => { setStatus('idle'); setProgress(0) }}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Novo Backup
                </button>
              </div>
            </motion.div>
          )}

          {/* Status: ERROR */}
          {status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Erro no Backup</h2>
              <p className="text-slate-500 mb-6">Ocorreu um erro ao gerar o backup. Tente novamente.</p>
              <button
                onClick={() => { setStatus('idle'); setProgress(0) }}
                className="px-6 py-3 bg-gradient-to-r from-[#EE4D2D] to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Tentar Novamente
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Backup History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Historico de Backups</h2>
              <p className="text-sm text-slate-500">{backups.length} backup(s) armazenado(s)</p>
            </div>
          </div>
        </div>

        {loadingBackups ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileArchive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum backup encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {backups.map((backup, index) => (
              <motion.div
                key={backup.filename}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FileArchive className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">{backup.filename}</p>
                    <p className="text-xs text-slate-400">{formatDate(backup.createdAt)} • {backup.sizeMB}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadBackup(backup.filename)}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBackup(backup.filename)}
                    disabled={deletingId === backup.filename}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletingId === backup.filename ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
