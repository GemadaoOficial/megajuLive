import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../services/api'
import { useTraining } from '../../contexts/TrainingContext'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle,
  Calendar,
  Video,
  TrendingUp,
  Award,
  Clock,
  Lock,
  Unlock,
  GraduationCap,
  Briefcase,
  Phone,
  MapPin,
  Cake,
  FileText,
  Settings,
  Bell,
  Eye,
  EyeOff,
  Key,
  Sparkles,
  Trophy,
  Target,
  Flame,
  Rocket,
  Medal,
  Crown,
} from 'lucide-react'
import Button from '../../components/ui/Button'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { completedVideos, isTrainingComplete, progressPercent, totalModules } = useTraining()

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birthdate: user?.birthdate || '',
    bio: user?.bio || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    liveReminders: true,
    trainingUpdates: true,
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await authAPI.updateProfile({ name: formData.name })
      updateUser(response.data.user)
      setIsEditing(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Preencha a senha atual e a nova senha')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas nao coincidem')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres')
      return
    }
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Senha alterada com sucesso!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      birthdate: user?.birthdate || '',
      bio: user?.bio || '',
    })
    setAvatarPreview(null)
    setIsEditing(false)
  }

  // Calculate level
  const getLevel = () => {
    if (completedVideos.length === 0) return { level: 1, title: 'Iniciante', icon: Rocket, color: 'from-slate-400 to-slate-500' }
    if (completedVideos.length <= 3) return { level: 2, title: 'Aprendiz', icon: Flame, color: 'from-amber-400 to-orange-500' }
    if (completedVideos.length <= 6) return { level: 3, title: 'Intermediario', icon: Target, color: 'from-blue-400 to-cyan-500' }
    if (completedVideos.length <= 9) return { level: 4, title: 'Avancado', icon: Medal, color: 'from-violet-400 to-purple-500' }
    return { level: 5, title: 'Expert', icon: Crown, color: 'from-amber-400 to-yellow-500' }
  }

  const currentLevel = getLevel()
  const LevelIcon = currentLevel.icon

  const stats = [
    { label: 'Lives Realizadas', value: user?.livesCount || 0, icon: Video, color: 'from-primary to-orange-500' },
    { label: 'Horas de Transmissao', value: user?.totalHours || 0, icon: Clock, color: 'from-violet-500 to-purple-500' },
    { label: 'Produtos Vendidos', value: user?.productsSold || 0, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
    { label: 'Modulos Concluidos', value: `${completedVideos.length}/${totalModules}`, icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
  ]

  const tabs = [
    { id: 'info', label: 'Informacoes', icon: User },
    { id: 'security', label: 'Seguranca', icon: Key },
    { id: 'notifications', label: 'Notificacoes', icon: Bell },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-40 -top-40 w-96 h-96 bg-gradient-to-br from-primary/30 to-orange-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-40 -bottom-40 w-96 h-96 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl overflow-hidden"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </motion.div>

            {isEditing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            {/* Level Badge */}
            <div className={`absolute -top-2 -left-2 w-10 h-10 rounded-xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center shadow-lg`}>
              <LevelIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              {user?.role === 'ADMIN' && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-sm font-semibold rounded-full flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-slate-400 mb-4">{user?.email}</p>

            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${currentLevel.color}`}>
                <LevelIcon className="w-5 h-5" />
                <span className="font-semibold">Nivel {currentLevel.level} - {currentLevel.title}</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                isTrainingComplete
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {isTrainingComplete ? (
                  <>
                    <Unlock className="w-5 h-5" />
                    <span className="font-semibold">Lives Liberadas</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold">Em Treinamento</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="ghost" className="text-white hover:bg-white/10">
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
                  <Save className="w-5 h-5 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                <Edit3 className="w-5 h-5 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/[0.05] rounded-2xl p-5 border border-white/[0.08]"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Training Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/[0.05] rounded-2xl p-6 border border-white/[0.08]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Progresso do Treinamento</h2>
            <p className="text-slate-500">Analista de Conteudo ao Vivo</p>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
              isTrainingComplete
                ? 'from-emerald-500 to-green-500'
                : 'from-primary to-orange-500'
            }`}>
              {progressPercent}%
            </p>
            <p className="text-sm text-slate-500">{completedVideos.length}/{totalModules} modulos</p>
          </div>
        </div>

        <div className="relative h-4 bg-white/[0.08] rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full rounded-full ${
              isTrainingComplete
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : 'bg-gradient-to-r from-primary to-orange-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isTrainingComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
            {isTrainingComplete ? 'Treinamento Concluido!' : 'Continue assistindo os modulos'}
          </span>
          {isTrainingComplete && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Certificado Disponivel
            </span>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white/[0.05] rounded-2xl border border-white/[0.08] overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-white/[0.08]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Info Tab */}
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-white/[0.03] text-white">{user?.name || '-'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-mail
                    </label>
                    <p className="px-4 py-3 rounded-xl bg-white/[0.03] text-white">{user?.email || '-'}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-white/[0.03] text-white">{user?.phone || 'Nao informado'}</p>
                    )}
                  </div>

                  {/* Birthdate */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Cake className="w-4 h-4 inline mr-2" />
                      Data de Nascimento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-white/[0.03] text-white">
                        {user?.birthdate ? new Date(user.birthdate).toLocaleDateString('pt-BR') : 'Nao informado'}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Endereco
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua, numero, bairro, cidade"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-white/[0.03] text-white">{user?.address || 'Nao informado'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Biografia
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Conte um pouco sobre voce..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none resize-none transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-white/[0.03] text-white">{user?.bio || 'Nenhuma biografia adicionada'}</p>
                    )}
                  </div>
                </div>

                {/* Role & Dates */}
                <div className="pt-6 border-t border-white/[0.08]">
                  <h3 className="font-semibold text-white mb-4">Informacoes da Conta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <p className="text-sm text-slate-500 mb-1">Funcao</p>
                      <p className="font-semibold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {user?.role === 'ADMIN' ? 'Administrador' : 'Analista de Conteudo ao Vivo'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <p className="text-sm text-slate-500 mb-1">Membro desde</p>
                      <p className="font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <p className="text-sm text-slate-500 mb-1">Status</p>
                      <p className="font-semibold text-emerald-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Ativo
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="font-semibold text-white">Alterar Senha</h3>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/[0.08] text-white placeholder-white/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>

                  <Button className="w-full mt-4" onClick={handleChangePassword}>
                    <Key className="w-5 h-5 mr-2" />
                    Alterar Senha
                  </Button>
                </div>

                <div className="pt-6 border-t border-white/[0.08]">
                  <h3 className="font-semibold text-white mb-4">Sessoes Ativas</h3>
                  <div className="p-4 rounded-xl bg-white/[0.03] flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Sessao Atual</p>
                      <p className="text-sm text-slate-500">Este dispositivo • Ultima atividade agora</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-sm font-medium rounded-full">
                      Ativa
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="font-semibold text-white">Preferencias de Notificacao</h3>

                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Notificacoes por E-mail', description: 'Receba atualizacoes importantes no seu e-mail' },
                    { key: 'push', label: 'Notificacoes Push', description: 'Receba alertas no navegador' },
                    { key: 'liveReminders', label: 'Lembretes de Lives', description: 'Seja lembrado antes das suas lives agendadas' },
                    { key: 'trainingUpdates', label: 'Atualizacoes de Treinamento', description: 'Receba novidades sobre novos conteudos' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key] ? 'bg-primary' : 'bg-white/[0.15]'
                        }`}
                      >
                        <motion.div
                          animate={{ x: notifications[item.key] ? 24 : 2 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <Button className="mt-4">
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Preferencias
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
