import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon, Key, Plus, Trash2, Loader2,
  Shield, Eye, EyeOff, Save, RefreshCw, Upload, Lock,
  Unlock, AlertTriangle, CheckCircle, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { settingsAPI } from '../../services/api'

export default function Settings() {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [reloading, setReloading] = useState(false)

  // Form state for add/edit
  const [formKey, setFormKey] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEncrypted, setFormEncrypted] = useState(true)
  const [formSaving, setFormSaving] = useState(false)
  const [editingKey, setEditingKey] = useState(null)

  // Masked values cache
  const [maskedValues, setMaskedValues] = useState({})
  const [visibleKeys, setVisibleKeys] = useState(new Set())

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const res = await settingsAPI.getAll()
      setConfigs(res.data.configs || [])
    } catch (error) {
      toast.error('Erro ao carregar configuracoes')
    } finally {
      setLoading(false)
    }
  }

  const loadMaskedValue = async (key) => {
    if (maskedValues[key]) {
      setVisibleKeys(prev => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
      return
    }

    try {
      const res = await settingsAPI.get(key)
      setMaskedValues(prev => ({ ...prev, [key]: res.data.maskedValue }))
      setVisibleKeys(prev => new Set(prev).add(key))
    } catch {
      toast.error('Erro ao carregar valor')
    }
  }

  const handleSave = async () => {
    if (!formKey.trim() || !formValue.trim()) {
      toast.error('Chave e valor sao obrigatorios')
      return
    }

    setFormSaving(true)
    try {
      await settingsAPI.set(formKey.trim(), {
        value: formValue.trim(),
        encrypted: formEncrypted,
        description: formDescription.trim() || undefined,
      })
      toast.success(`Configuracao "${formKey}" salva com sucesso`)
      resetForm()
      loadConfigs()
      // Clear cached masked value
      setMaskedValues(prev => {
        const next = { ...prev }
        delete next[formKey.trim()]
        return next
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar configuracao')
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async (key) => {
    if (!confirm(`Tem certeza que deseja remover "${key}"?`)) return

    try {
      await settingsAPI.delete(key)
      toast.success(`Configuracao "${key}" removida`)
      loadConfigs()
    } catch {
      toast.error('Erro ao remover configuracao')
    }
  }

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const res = await settingsAPI.migrate()
      const { migrated, skipped } = res.data
      if (migrated.length > 0) {
        toast.success(`${migrated.length} configuracoes migradas: ${migrated.join(', ')}`)
      }
      if (skipped.length > 0) {
        toast.info(`${skipped.length} ja existiam ou estavam vazias: ${skipped.join(', ')}`)
      }
      if (migrated.length === 0 && skipped.length === 0) {
        toast.info('Nenhuma variavel de ambiente encontrada para migrar')
      }
      loadConfigs()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao migrar configuracoes')
    } finally {
      setMigrating(false)
    }
  }

  const handleReload = async () => {
    setReloading(true)
    try {
      await settingsAPI.reload()
      toast.success('Configuracoes recarregadas do banco de dados')
    } catch {
      toast.error('Erro ao recarregar configuracoes')
    } finally {
      setReloading(false)
    }
  }

  const resetForm = () => {
    setShowAddModal(false)
    setEditingKey(null)
    setFormKey('')
    setFormValue('')
    setFormDescription('')
    setFormEncrypted(true)
  }

  const openEdit = (config) => {
    setEditingKey(config.key)
    setFormKey(config.key)
    setFormValue('')
    setFormDescription(config.description || '')
    setFormEncrypted(config.encrypted)
    setShowAddModal(true)
  }

  const predefinedKeys = [
    { key: 'JWT_SECRET', description: 'Chave secreta para tokens JWT' },
    { key: 'OPENAI_API_KEY', description: 'Chave da API OpenAI' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Configuracoes do Sistema</h1>
            <p className="text-slate-400 mt-1">Gerencie chaves e segredos criptografados no banco de dados</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400">Armazenamento Seguro</h3>
            <p className="text-emerald-400 text-sm mt-1">
              Todas as configuracoes marcadas como criptografadas sao protegidas com AES-256-GCM.
              Mesmo que o banco de dados seja comprometido, os valores permanecem inacessiveis sem a chave de criptografia.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { resetForm(); setShowAddModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Configuracao
        </button>
        <button
          onClick={handleMigrate}
          disabled={migrating}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors font-medium disabled:opacity-50"
        >
          {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Migrar do .env
        </button>
        <button
          onClick={handleReload}
          disabled={reloading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
        >
          {reloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Recarregar
        </button>
      </div>

      {/* Configs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : configs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Nenhuma configuracao</h3>
          <p className="text-slate-400 mt-2 max-w-md mx-auto">
            Clique em "Migrar do .env" para importar suas variaveis de ambiente atuais,
            ou adicione manualmente.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden"
        >
          <div className="divide-y divide-white/6">
            {configs.map((config, idx) => (
              <div
                key={config.key}
                className="p-5 hover:bg-white/3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${config.encrypted ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                      {config.encrypted ? (
                        <Lock className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-white">{config.key}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          config.encrypted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {config.encrypted ? 'Criptografado' : 'Texto plano'}
                        </span>
                      </div>
                      {config.description && (
                        <p className="text-sm text-slate-400 mt-0.5">{config.description}</p>
                      )}
                      {visibleKeys.has(config.key) && maskedValues[config.key] && (
                        <p className="text-sm font-mono text-slate-400 mt-1">{maskedValues[config.key]}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Atualizado: {new Date(config.updatedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => loadMaskedValue(config.key)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-300 transition-colors"
                      title={visibleKeys.has(config.key) ? 'Esconder valor' : 'Ver valor mascarado'}
                    >
                      {visibleKeys.has(config.key) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(config)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Editar valor"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.key)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) resetForm() }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a12] border border-white/8 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                {editingKey ? `Editar: ${editingKey}` : 'Nova Configuracao'}
              </h2>

              <div className="space-y-4">
                {/* Key */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Chave</label>
                  {editingKey ? (
                    <div className="px-4 py-3 rounded-xl bg-white/5 font-mono text-slate-300">
                      {editingKey}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={formKey}
                        onChange={(e) => setFormKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                        placeholder="NOME_DA_VARIAVEL"
                        className="w-full px-4 py-3 rounded-xl bg-white/3 border-2 border-white/8 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-hidden transition-all font-mono"
                      />
                      {/* Quick select predefined keys */}
                      <div className="flex gap-2 mt-2">
                        {predefinedKeys
                          .filter(pk => !configs.some(c => c.key === pk.key))
                          .map(pk => (
                            <button
                              key={pk.key}
                              onClick={() => { setFormKey(pk.key); setFormDescription(pk.description) }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                            >
                              {pk.key}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    {editingKey ? 'Novo Valor' : 'Valor'}
                  </label>
                  <input
                    type="password"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={editingKey ? 'Digite o novo valor...' : 'Valor do segredo...'}
                    className="w-full px-4 py-3 rounded-xl bg-white/3 border-2 border-white/8 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-hidden transition-all font-mono"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Descricao (opcional)</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Descricao da configuracao..."
                    className="w-full px-4 py-3 rounded-xl bg-white/3 border-2 border-white/8 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-hidden transition-all"
                  />
                </div>

                {/* Encrypted toggle */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3">
                  <button
                    onClick={() => setFormEncrypted(!formEncrypted)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formEncrypted ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      formEncrypted ? 'translate-x-6' : ''
                    }`} />
                  </button>
                  <div>
                    <span className="font-medium text-slate-200">
                      {formEncrypted ? 'Criptografado (AES-256)' : 'Texto plano'}
                    </span>
                    <p className="text-xs text-slate-400">
                      {formEncrypted
                        ? 'Valor sera criptografado antes de salvar no banco'
                        : 'Valor sera salvo sem criptografia'}
                    </p>
                  </div>
                </div>

                {!formEncrypted && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-400">
                      Valores sem criptografia ficam visiveis no banco de dados
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/8 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={formSaving || !formKey.trim() || !formValue.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                >
                  {formSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Migration Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/8 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Guia de Migracao
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
            <p>Clique em <strong>"Migrar do .env"</strong> para importar JWT_SECRET e OPENAI_API_KEY automaticamente</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
            <p>Verifique que as chaves aparecem na lista acima com status <strong>"Criptografado"</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
            <p>Remova <strong>JWT_SECRET</strong> e <strong>OPENAI_API_KEY</strong> do arquivo <code className="bg-white/5 px-1.5 py-0.5 rounded-sm">.env</code></p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold">4</div>
            <p>Reinicie o servidor — ele carregara os segredos do banco automaticamente</p>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/8">
            <p className="font-mono text-xs text-slate-400">
              <span className="text-slate-400">## Seu .env final deve ter apenas:</span><br />
              DATABASE_URL="postgresql://..."<br />
              ENCRYPTION_KEY="chave-hex-64-chars"<br />
              PORT=5000
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
