import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../../services/api'
import { useTraining } from '../../contexts/TrainingContext'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  GraduationCap,
  SkipForward,
  CheckCircle,
} from 'lucide-react'

export default function UserManagement() {
  const { grantSkipPermission, revokeSkipPermission, hasUserSkipPermission } = useTraining()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COLABORADOR',
  })

  const handleToggleSkipTraining = (userId) => {
    if (hasUserSkipPermission(userId)) {
      revokeSkipPermission(userId)
    } else {
      grantSkipPermission(userId)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'COLABORADOR',
      })
    }
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, formData)
      } else {
        await adminAPI.createUser(formData)
      }
      await loadUsers()
      setModalOpen(false)
    } catch (error) {
      console.error('Erro ao salvar usuario:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuario?')) return

    try {
      await adminAPI.deleteUser(id)
      await loadUsers()
    } catch (error) {
      console.error('Erro ao excluir usuario:', error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestao de Usuarios</h1>
          <p className="text-slate-400 mt-1">Gerencie os usuarios da plataforma</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" />
          Novo Usuario
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-slate-400">Total de usuarios</p>
          </div>
        </div>
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/100/100/20">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {users.filter((u) => u.role === 'ADMIN').length}
            </p>
            <p className="text-xs text-slate-400">Administradores</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Funcao</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Treinamento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Criado em</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-emerald-500/100/100/20 text-emerald-400'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Admin' : 'Colaborador'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/100/100/20 text-amber-400">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : hasUserSkipPermission(user.id) ? (
                      <button
                        onClick={() => handleToggleSkipTraining(user.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/100/100/20 text-emerald-400 hover:bg-emerald-200 transition-colors"
                        title="Clique para revogar permissao"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Liberado
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleSkipTraining(user.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] text-slate-300 hover:bg-violet-500/100/20 hover:text-violet-400 transition-colors"
                        title="Clique para liberar sem treinamento"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        Pular
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg hover:bg-red-500/100/100/100/100/20 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400">Nenhum usuario encontrado</p>
          </div>
        )}
      </motion.div>

      {/* User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Novo Usuario'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Nome completo"
            icon={User}
            placeholder="Nome do usuario"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={editingUser ? 'Nova senha (deixe vazio para manter)' : 'Senha'}
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Funcao</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
