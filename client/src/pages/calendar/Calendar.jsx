import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { livesAPI } from '../../services/api'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
  CalendarDays,
  Zap,
  TrendingUp,
  Users,
  Eye,
  MoreHorizontal,
  X,
} from 'lucide-react'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const DAYS_FULL = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8am to 9pm

const statusConfig = {
  SCHEDULED: { label: 'Agendada', color: 'bg-blue-500', lightColor: 'bg-blue-500/15 text-blue-400', icon: Clock, gradient: 'from-blue-500 to-blue-600' },
  LIVE: { label: 'Ao Vivo', color: 'bg-red-500', lightColor: 'bg-red-500/15 text-red-400', icon: Play, gradient: 'from-red-500 to-rose-600' },
  COMPLETED: { label: 'Concluida', color: 'bg-emerald-500', lightColor: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
  CANCELLED: { label: 'Cancelada', color: 'bg-slate-400', lightColor: 'bg-white/[0.05] text-slate-400', icon: XCircle, gradient: 'from-slate-400 to-slate-500' },
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, agenda
  const [lives, setLives] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedLive, setSelectedLive] = useState(null)
  const [editingLive, setEditingLive] = useState(null)
  const [hoveredDay, setHoveredDay] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLives()
  }, [])

  const loadLives = async () => {
    try {
      const response = await livesAPI.getAll()
      setLives(response.data.data || response.data.lives || [])
    } catch (error) {
      console.error('Erro ao carregar lives:', error)
      setLives([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -firstDay.getDay() + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      return d
    })
  }

  const getLivesForDate = (date) => {
    if (!date) return []
    return lives.filter((live) => {
      const liveDate = new Date(live.scheduledAt)
      return (
        liveDate.getDate() === date.getDate() &&
        liveDate.getMonth() === date.getMonth() &&
        liveDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getStats = useMemo(() => {
    const now = new Date()
    const monthLives = lives.filter((live) => {
      const liveDate = new Date(live.scheduledAt)
      return (
        liveDate.getMonth() === currentDate.getMonth() &&
        liveDate.getFullYear() === currentDate.getFullYear()
      )
    })

    const upcomingLives = lives.filter(l => l.status === 'SCHEDULED' && new Date(l.scheduledAt) > now)
    const nextLive = upcomingLives.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0]

    return {
      monthTotal: monthLives.length,
      scheduled: lives.filter(l => l.status === 'SCHEDULED').length,
      completed: lives.filter(l => l.status === 'COMPLETED').length,
      totalHours: monthLives.reduce((acc, l) => acc + (l.duration || 0), 0) / 60,
      totalViews: lives.reduce((acc, l) => acc + (l.views || 0), 0),
      nextLive,
    }
  }, [lives, currentDate])

  const handlePrevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))
    }
  }

  const handleNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date, hour = null) => {
    setSelectedDate(date)
    setEditingLive(null)
    const targetDate = new Date(date)
    if (hour !== null) {
      targetDate.setHours(hour, 0, 0, 0)
    }
    const dateStr = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setFormData({
      title: '',
      description: '',
      scheduledAt: dateStr,
      duration: 60,
    })
    setModalOpen(true)
  }

  const handleEditLive = (live, e) => {
    e?.stopPropagation()
    setEditingLive(live)
    const liveDate = new Date(live.scheduledAt)
    const dateStr = new Date(liveDate.getTime() - liveDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setFormData({
      title: live.title,
      description: live.description || '',
      scheduledAt: dateStr,
      duration: live.duration || 60,
    })
    setDetailModalOpen(false)
    setModalOpen(true)
  }

  const handleViewLive = (live, e) => {
    e?.stopPropagation()
    setSelectedLive(live)
    setDetailModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingLive) {
        await livesAPI.update(editingLive.id, {
          ...formData,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        })
      } else {
        await livesAPI.create({
          ...formData,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        })
      }
      await loadLives()
      setModalOpen(false)
      setEditingLive(null)
    } catch (error) {
      console.error('Erro ao salvar live:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    if (!confirm('Tem certeza que deseja excluir esta live?')) return

    try {
      await livesAPI.delete(id)
      await loadLives()
      setDetailModalOpen(false)
    } catch (error) {
      console.error('Erro ao excluir live:', error)
    }
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = getWeekDays(currentDate)
  const today = new Date()

  const isToday = (date) => (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )

  const formatTimeUntil = (date) => {
    const now = new Date()
    const diff = new Date(date) - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `em ${days} dia${days > 1 ? 's' : ''}`
    if (hours > 0) return `em ${hours}h`
    return 'em breve'
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Header */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary via-orange-500 to-amber-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <p className="text-white/80 text-sm font-medium">Calendario de Lives</p>
            <h1 className="text-2xl font-bold mt-1">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h1>

            {getStats.nextLive && (
              <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xs text-white/70">Proxima live {formatTimeUntil(getStats.nextLive.scheduledAt)}</p>
                <p className="font-semibold truncate">{getStats.nextLive.title}</p>
                <p className="text-sm text-white/80">
                  {new Date(getStats.nextLive.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/15">
              <CalendarDays className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-full">Este mes</span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-white">{getStats.monthTotal}</p>
            <p className="text-sm text-slate-400">Lives programadas</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-violet-500/15">
              <Eye className="w-5 h-5 text-violet-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-white">{(getStats.totalViews / 1000).toFixed(1)}K</p>
            <p className="text-sm text-slate-400">Visualizacoes totais</p>
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.05] border border-white/[0.08] rounded-xl p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPeriod}
            className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <button
            onClick={handleNextPeriod}
            className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            Hoje
          </button>
          <span className="text-sm font-semibold text-white ml-2">
            {view === 'month'
              ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : `Semana de ${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${MONTHS[weekDays[0].getMonth()]}`
            }
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-white/[0.05] rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'month' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'week' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'agenda' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => handleDayClick(new Date())}>
            <Plus className="w-4 h-4" />
            Nova Live
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            <span className="text-slate-400">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Views */}
      <AnimatePresence mode="wait">
        {view === 'month' && (
          <motion.div
            key="month"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            {/* Days header */}
            <div className="grid grid-cols-7 bg-white/[0.03] border-b border-white/[0.06]">
              {DAYS.map((day, i) => (
                <div key={day} className={`text-center text-xs font-semibold py-3 ${i === 0 || i === 6 ? 'text-slate-400' : 'text-slate-300'}`}>
                  <span className="hidden sm:inline">{DAYS_FULL[i]}</span>
                  <span className="sm:hidden">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {days.map(({ date, isCurrentMonth }, index) => {
                const dayLives = getLivesForDate(date)
                const dayIsToday = isToday(date)
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                const isHovered = hoveredDay === index

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => handleDayClick(date)}
                    className={`
                      min-h-[110px] p-2 border-b border-r border-white/[0.06] cursor-pointer relative group transition-colors
                      ${!isCurrentMonth ? 'bg-white/[0.02]' : 'hover:bg-white/[0.03]'}
                      ${dayIsToday ? 'bg-primary/5 hover:bg-primary/10' : ''}
                    `}
                  >
                    {/* Quick add button */}
                    <AnimatePresence>
                      {isHovered && isCurrentMonth && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={(e) => { e.stopPropagation(); handleDayClick(date); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <div className="flex items-start justify-between">
                      <span className={`
                        text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors
                        ${!isCurrentMonth ? 'text-slate-500' : isWeekend ? 'text-slate-400' : 'text-slate-200'}
                        ${dayIsToday ? 'bg-primary text-white font-bold' : ''}
                      `}>
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="mt-1 space-y-1">
                      {dayLives.slice(0, 3).map((live) => (
                        <motion.div
                          key={live.id}
                          layoutId={`live-${live.id}`}
                          onClick={(e) => handleViewLive(live, e)}
                          className={`
                            text-[11px] px-2 py-1 rounded-md font-medium truncate cursor-pointer
                            bg-gradient-to-r ${statusConfig[live.status]?.gradient || 'from-slate-400 to-slate-500'} text-white
                            hover:shadow-md transition-shadow
                          `}
                        >
                          <span className="flex items-center gap-1">
                            <span className="opacity-80">
                              {new Date(live.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="truncate">{live.title}</span>
                          </span>
                        </motion.div>
                      ))}
                      {dayLives.length > 3 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="text-[10px] text-slate-500 font-medium pl-1 hover:text-primary"
                        >
                          +{dayLives.length - 3} mais
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {view === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            {/* Week header */}
            <div className="grid grid-cols-8 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="p-3 text-center text-xs font-semibold text-slate-400 border-r border-white/[0.06]">
                Horario
              </div>
              {weekDays.map((date, i) => {
                const dayIsToday = isToday(date)
                return (
                  <div key={i} className={`p-3 text-center border-r border-white/[0.06] last:border-r-0 ${dayIsToday ? 'bg-primary/5' : ''}`}>
                    <p className={`text-xs font-medium ${dayIsToday ? 'text-primary' : 'text-slate-500'}`}>{DAYS[i]}</p>
                    <p className={`text-lg font-bold mt-1 ${dayIsToday ? 'text-primary' : 'text-white'}`}>{date.getDate()}</p>
                  </div>
                )
              })}
            </div>

            {/* Time grid */}
            <div className="max-h-[600px] overflow-y-auto">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-white/[0.06] last:border-b-0">
                  <div className="p-2 text-xs text-slate-400 font-medium text-right pr-3 border-r border-white/[0.06]">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {weekDays.map((date, i) => {
                    const dayLives = getLivesForDate(date).filter(live => {
                      const liveHour = new Date(live.scheduledAt).getHours()
                      return liveHour === hour
                    })
                    const dayIsToday = isToday(date)

                    return (
                      <div
                        key={i}
                        onClick={() => handleDayClick(date, hour)}
                        className={`
                          min-h-[60px] p-1 border-r border-white/[0.06] last:border-r-0 cursor-pointer
                          hover:bg-white/[0.03] transition-colors relative group
                          ${dayIsToday ? 'bg-primary/5 hover:bg-primary/10' : ''}
                        `}
                      >
                        {dayLives.map((live) => (
                          <motion.div
                            key={live.id}
                            onClick={(e) => handleViewLive(live, e)}
                            className={`
                              text-[10px] px-2 py-1.5 rounded-md font-medium cursor-pointer
                              bg-gradient-to-r ${statusConfig[live.status]?.gradient} text-white
                              hover:shadow-md transition-shadow
                            `}
                          >
                            <p className="font-semibold truncate">{live.title}</p>
                            <p className="opacity-80">{live.duration}min</p>
                          </motion.div>
                        ))}

                        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-slate-300" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'agenda' && (
          <motion.div
            key="agenda"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : lives.length > 0 ? (
              <>
                {/* Group by date */}
                {Object.entries(
                  lives
                    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                    .reduce((acc, live) => {
                      const dateKey = new Date(live.scheduledAt).toDateString()
                      if (!acc[dateKey]) acc[dateKey] = []
                      acc[dateKey].push(live)
                      return acc
                    }, {})
                ).map(([dateKey, dateLives]) => {
                  const date = new Date(dateKey)
                  const dayIsToday = isToday(date)
                  const isPast = date < new Date(today.toDateString())

                  return (
                    <div key={dateKey} className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden">
                      <div className={`px-5 py-3 border-b border-white/[0.06] flex items-center justify-between ${dayIsToday ? 'bg-primary/5' : 'bg-white/[0.03]'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${dayIsToday ? 'bg-primary text-white' : 'bg-white/[0.08] text-slate-300'}`}>
                            {date.getDate()}
                          </div>
                          <div>
                            <p className={`font-semibold ${dayIsToday ? 'text-primary' : 'text-white'}`}>
                              {dayIsToday ? 'Hoje' : DAYS_FULL[date.getDay()]}
                            </p>
                            <p className="text-xs text-slate-500">
                              {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{dateLives.length} live{dateLives.length > 1 ? 's' : ''}</span>
                      </div>

                      <div className="divide-y divide-white/[0.06]">
                        {dateLives.map((live, index) => {
                          const StatusIcon = statusConfig[live.status]?.icon || Clock
                          return (
                            <motion.div
                              key={live.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={(e) => handleViewLive(live, e)}
                              className="p-4 flex items-center gap-4 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                            >
                              <div className="text-center min-w-[50px]">
                                <p className="text-lg font-bold text-white">
                                  {new Date(live.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-[10px] text-slate-400">{live.duration}min</p>
                              </div>

                              <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${statusConfig[live.status]?.gradient}`} />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white truncate">{live.title}</p>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig[live.status]?.lightColor}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig[live.status]?.label}
                                  </span>
                                </div>
                                {live.description && (
                                  <p className="text-sm text-slate-500 truncate mt-1">{live.description}</p>
                                )}
                                {live.views > 0 && (
                                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> {live.views.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" /> {live.sales} vendas
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleEditLive(live, e)}
                                  className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(live.id, e)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
                  <CalendarIcon className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma live encontrada</p>
                <p className="text-slate-400 text-sm mt-1">Clique em "Nova Live" para comecar</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Live Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLive(null); }}
        title={editingLive ? 'Editar Live' : 'Agendar Nova Live'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Titulo da Live"
            placeholder="Ex: Super Promocao de Verao"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Descricao
            </label>
            <textarea
              placeholder="Descreva o conteudo da live, produtos que serao apresentados..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data e Hora"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Duracao</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
                <option value={150}>2h 30min</option>
                <option value={180}>3 horas</option>
                <option value={240}>4 horas</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); setEditingLive(null); }} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editingLive ? 'Salvar Alteracoes' : 'Agendar Live'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title=""
        size="lg"
      >
        {selectedLive && (
          <div className="space-y-6">
            {/* Header with gradient */}
            <div className={`-mx-6 -mt-6 px-6 py-8 bg-gradient-to-r ${statusConfig[selectedLive.status]?.gradient || 'from-slate-500 to-slate-600'} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                  {statusConfig[selectedLive.status]?.label}
                </span>
                <h3 className="text-2xl font-bold mt-3">{selectedLive.title}</h3>
                {selectedLive.description && (
                  <p className="text-white/80 mt-2">{selectedLive.description}</p>
                )}
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  Data
                </div>
                <p className="font-semibold text-white">
                  {new Date(selectedLive.scheduledAt).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  Horario
                </div>
                <p className="font-semibold text-white">
                  {new Date(selectedLive.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  <span className="text-slate-400 font-normal ml-2">({selectedLive.duration} min)</span>
                </p>
              </div>
            </div>

            {/* Stats if completed */}
            {selectedLive.status === 'COMPLETED' && (selectedLive.views > 0 || selectedLive.sales > 0) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-violet-500/15 rounded-xl p-4 text-center">
                  <Eye className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-violet-300">{selectedLive.views?.toLocaleString()}</p>
                  <p className="text-sm text-violet-400">Visualizacoes</p>
                </div>
                <div className="bg-emerald-500/15 rounded-xl p-4 text-center">
                  <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-300">{selectedLive.sales}</p>
                  <p className="text-sm text-emerald-400">Vendas</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={(e) => { setDetailModalOpen(false); handleEditLive(selectedLive, e); }}
                className="flex-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => handleDelete(selectedLive.id, e)}
                className="flex-1 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
