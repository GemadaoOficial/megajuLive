import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Mail, Lock, Flame, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-dark-bg via-[#0a0a12] to-dark-bg flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-orange-500 to-amber-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px'}} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MegaJu</h1>
              <p className="text-white/70 text-sm">Live Management</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Gerencie suas lives<br />
            com facilidade
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Plataforma completa para streamers. Agende, execute e analise suas transmissoes.
          </p>

          <div className="mt-8 flex gap-4">
            <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-4">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-white/70 text-sm">Streamers ativos</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-4">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-white/70 text-sm">Lives realizadas</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          2024 MegaJu. Todos os direitos reservados.
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-orange-500 mb-4 shadow-lg shadow-primary/30">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">MegaJu</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Bem-vindo de volta!</h2>
            <p className="text-slate-400 mt-2">Entre na sua conta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha"
              type="password"
              icon={Lock}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded-sm border-white/8 bg-white/5 text-primary focus:ring-primary" />
                <span className="text-slate-400">Lembrar de mim</span>
              </label>
              <a href="#" className="text-primary hover:text-orange-600 font-medium">
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Entrar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-slate-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Register link */}
          <p className="text-center text-slate-400">
            Nao tem uma conta?{' '}
            <Link to="/register" className="text-primary hover:text-orange-600 font-semibold">
              Cadastre-se gratis
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/8">
            <p className="text-xs text-slate-400 font-medium mb-2">Credenciais de teste:</p>
            <div className="space-y-1 text-xs text-slate-300">
              <p><span className="font-semibold">Admin:</span> admin@megaju.com / admin123</p>
              <p><span className="font-semibold">User:</span> user@megaju.com / user123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
