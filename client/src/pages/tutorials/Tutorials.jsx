import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../../components/ui/Modal'
import VideoPlayer from '../../components/ui/VideoPlayer'
import { useTraining } from '../../contexts/TrainingContext'
import {
  GraduationCap,
  Play,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Video,
  Trophy,
  Lock,
  Sparkles,
  Flame,
  Target,
  Zap,
  Medal,
  Crown,
  Rocket,
  TrendingUp,
  Gift,
  Calendar,
  Unlock,
  Radio,
} from 'lucide-react'
import { trainingVideos, supportMaterials, trainingInfo } from './data/trainingData'

export default function Tutorials() {
  const navigate = useNavigate()
  const {
    completedVideos,
    markVideoCompleted,
    isVideoCompleted,
    isTrainingComplete,
    progressPercent,
    remainingModules,
  } = useTraining()

  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [expandedSections, setExpandedSections] = useState({ videos: true, materials: true })
  const [showConfetti, setShowConfetti] = useState(false)

  const markAsCompleted = (videoId) => {
    markVideoCompleted(videoId)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Calculate level based on progress
  const getLevel = () => {
    if (completedVideos.length === 0) return { level: 1, title: 'Iniciante', icon: Rocket }
    if (completedVideos.length <= 3) return { level: 2, title: 'Aprendiz', icon: Flame }
    if (completedVideos.length <= 6) return { level: 3, title: 'Intermediario', icon: Target }
    if (completedVideos.length <= 9) return { level: 4, title: 'Avancado', icon: Medal }
    return { level: 5, title: 'Expert', icon: Crown }
  }

  const currentLevel = getLevel()
  const LevelIcon = currentLevel.icon

  const achievements = [
    { id: 'first', name: 'Primeiro Passo', description: 'Complete 1 modulo', unlocked: completedVideos.length >= 1, icon: Rocket },
    { id: 'halfway', name: 'Meio Caminho', description: 'Complete 5 modulos', unlocked: completedVideos.length >= 5, icon: TrendingUp },
    { id: 'almost', name: 'Quase La', description: 'Complete 9 modulos', unlocked: completedVideos.length >= 9, icon: Target },
    { id: 'complete', name: 'Liberado!', description: 'Acesso as Lives', unlocked: isTrainingComplete, icon: Unlock },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 1200, rotate: 0, scale: 0 }}
                animate={{ y: 1000, rotate: Math.random() * 720 - 360, scale: [0, 1, 1, 0.5] }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeOut' }}
                className={`absolute w-3 h-3 rounded-full ${['bg-primary', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400', 'bg-pink-400'][i % 5]}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner - Training Complete */}
      <AnimatePresence>
        {isTrainingComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-6 text-white"
          >
            <div className="absolute inset-0">
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <Unlock className="w-8 h-8" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">Treinamento Concluido!</h2>
                  <p className="text-white/90">Parabens! Voce agora tem acesso completo a secao de Lives.</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/live')}
                className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Radio className="w-5 h-5" />
                Ir para Lives
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white"
      >
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
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              className="absolute"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            >
              <Sparkles className="w-4 h-4 text-amber-400/60" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </motion.div>
            <span className="text-sm font-medium text-amber-200">TREINAMENTO OBRIGATORIO</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
              Analista de Conteudo
            </span>
            <br />
            <span className="text-primary">ao Vivo</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg max-w-xl mb-8"
          >
            Complete todos os modulos para desbloquear o acesso a secao de Lives.
            Este treinamento e obrigatorio para novos colaboradores.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            {[
              { icon: Video, label: '10 Videos', color: 'from-primary to-orange-500' },
              { icon: Clock, label: trainingInfo.totalDuration, color: 'from-violet-500 to-purple-500' },
              { icon: FileText, label: `${supportMaterials.length} Materiais`, color: 'from-blue-500 to-cyan-500' },
              { icon: isTrainingComplete ? Unlock : Lock, label: isTrainingComplete ? 'Liberado' : 'Bloqueado', color: isTrainingComplete ? 'from-emerald-500 to-green-500' : 'from-slate-500 to-slate-600' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Progress & Level Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isTrainingComplete
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                    : 'bg-gradient-to-br from-primary to-orange-500'
                }`}
              >
                {isTrainingComplete ? (
                  <Unlock className="w-8 h-8 text-white" />
                ) : (
                  <LevelIcon className="w-8 h-8 text-white" />
                )}
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {isTrainingComplete ? 'Concluido!' : `Nivel ${currentLevel.level}`}
                  </h2>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isTrainingComplete
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {isTrainingComplete ? 'LIBERADO' : currentLevel.title}
                  </span>
                </div>
                <p className="text-slate-500">
                  {completedVideos.length} de {trainingVideos.length} modulos concluidos
                </p>
              </div>
            </div>

            <div className="text-right">
              <motion.div
                key={progressPercent}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className={`text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isTrainingComplete
                    ? 'from-emerald-500 to-green-500'
                    : 'from-primary to-orange-500'
                }`}
              >
                {progressPercent}%
              </motion.div>
            </div>
          </div>

          {/* XP-like Progress Bar */}
          <div className="relative">
            <div className="w-full h-4 bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full relative ${
                  isTrainingComplete
                    ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500'
                    : 'bg-gradient-to-r from-primary via-orange-500 to-amber-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.div>
            </div>

            <div className="absolute top-0 left-0 right-0 h-full flex justify-between px-1">
              {[0, 25, 50, 75, 100].map((mark) => (
                <div
                  key={mark}
                  className={`w-0.5 h-full ${
                    progressPercent >= mark ? 'bg-white/50' : 'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>
          </div>

          {!isTrainingComplete ? (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-300">Acesso a Lives Bloqueado</p>
                  <p className="text-sm text-amber-400">
                    Faltam <span className="font-bold">{remainingModules} modulos</span> para desbloquear o acesso as Lives.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <Unlock className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-300">Acesso Liberado!</p>
                  <p className="text-sm text-emerald-400">
                    Voce pode acessar a secao de Lives agora.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/live')}
                  className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  Ir para Lives
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Achievements Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">Conquistas</h3>
          </div>

          <div className="space-y-3">
            {achievements.map((achievement, index) => {
              const AchIcon = achievement.icon
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    achievement.unlocked
                      ? achievement.id === 'complete'
                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
                      : 'bg-white/5 border border-white/10 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    achievement.unlocked
                      ? achievement.id === 'complete'
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                      : 'bg-slate-700'
                  }`}>
                    {achievement.unlocked ? (
                      <AchIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${achievement.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {achievement.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle className={`w-5 h-5 ${achievement.id === 'complete' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Learning Path - Video Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('videos')}
          className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center"
            >
              <Video className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white">Trilha de Aprendizado</h2>
              <p className="text-slate-500">10 modulos • {trainingInfo.totalVideoDuration} de conteudo</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.videos ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.videos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <div className="relative">
                  {/* Connection Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-primary via-violet-500 to-emerald-500 rounded-full" />

                  <div className="space-y-4">
                    {trainingVideos.map((video, index) => {
                      const Icon = video.icon
                      const completed = isVideoCompleted(video.id)
                      const isLocked = index > 0 && !isVideoCompleted(trainingVideos[index - 1].id)
                      const isNext = !completed && !isLocked && (index === 0 || isVideoCompleted(trainingVideos[index - 1].id))

                      return (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          <motion.div
                            onClick={() => !isLocked && setSelectedVideo(video)}
                            whileHover={!isLocked ? { scale: 1.01, x: 5 } : {}}
                            whileTap={!isLocked ? { scale: 0.99 } : {}}
                            className={`ml-16 p-5 rounded-2xl border-2 transition-all ${
                              isLocked
                                ? 'bg-white/[0.03] border-white/[0.08] opacity-60 cursor-not-allowed'
                                : completed
                                  ? 'bg-emerald-500/10 border-emerald-500/30 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10'
                                  : isNext
                                    ? 'bg-gradient-to-r from-primary/5 to-orange-500/5 border-primary cursor-pointer hover:shadow-lg hover:shadow-primary/20'
                                    : 'bg-white/[0.05] border-white/[0.08] cursor-pointer hover:border-white/[0.15] hover:shadow-md'
                            }`}
                          >
                            {/* Node indicator */}
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 ${
                              completed
                                ? 'bg-emerald-500 border-emerald-500/30'
                                : isNext
                                  ? 'bg-primary border-primary/30 animate-pulse'
                                  : isLocked
                                    ? 'bg-white/[0.08] border-white/[0.08]'
                                    : 'bg-white/[0.05] border-white/[0.1]'
                            }`}>
                              {completed ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3 text-slate-500" />
                              ) : (
                                <span className="text-xs font-bold text-slate-300">{video.moduleNumber}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${video.gradient} ${isLocked ? 'opacity-50' : ''}`}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    completed
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : isNext
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-white/[0.05] text-slate-400'
                                  }`}>
                                    MODULO {video.moduleNumber}
                                  </span>
                                  {isNext && (
                                    <motion.span
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                      className="text-xs font-bold text-primary flex items-center gap-1"
                                    >
                                      <Zap className="w-3 h-3" />
                                      PROXIMO
                                    </motion.span>
                                  )}
                                  {completed && (
                                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      CONCLUIDO
                                    </span>
                                  )}
                                </div>
                                <h3 className={`font-bold text-lg ${
                                  completed ? 'text-emerald-300' : 'text-white'
                                }`}>
                                  {video.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-1">{video.description}</p>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <span className="text-sm font-medium text-slate-400 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {video.duration}
                                </span>
                                {!isLocked && (
                                  <motion.div
                                    whileHover={{ x: 5 }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      completed
                                        ? 'bg-emerald-500/15'
                                        : 'bg-white/[0.05] group-hover:bg-primary/10'
                                    }`}
                                  >
                                    {completed ? (
                                      <Play className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-slate-400" />
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Support Materials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('materials')}
          className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: -10 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
            >
              <FileText className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white">Materiais de Apoio</h2>
              <p className="text-slate-500">{supportMaterials.length} documentos • PDFs e Docs</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.materials ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.materials && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportMaterials.map((material, index) => {
                  const Icon = material.icon

                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMaterial(material)}
                      className="relative group p-5 rounded-2xl bg-white/[0.05] border-2 border-white/[0.08] hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all" />

                      <div className="relative">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500 group-hover:to-cyan-500 flex items-center justify-center transition-all duration-300"
                          >
                            <Icon className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                              {material.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                              {material.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                            material.type === 'pdf'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-blue-500/15 text-blue-400'
                          }`}>
                            {material.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 group-hover:text-blue-500 flex items-center gap-1">
                            Abrir <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Training Info Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 text-white overflow-hidden relative"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Jornada Completa</h3>
              <p className="text-slate-400">Seu caminho para se tornar um Analista de Conteudo ao Vivo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Video, title: 'Video Aulas', duration: trainingInfo.totalVideoDuration, description: '10 modulos completos', color: 'from-primary to-orange-500' },
              { icon: Target, title: 'Pratica', duration: trainingInfo.practicalDuration, description: 'Live supervisionada', color: 'from-violet-500 to-purple-500' },
              { icon: Unlock, title: 'Liberacao', duration: 'Acesso', description: 'Secao de Lives', color: 'from-emerald-500 to-green-500' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">{item.description}</p>
                  <p className="text-3xl font-bold">{item.duration}</p>
                  <p className="text-white/80 font-medium mt-1">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Video Detail Modal */}
      <Modal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo?.title}
        size="xl"
      >
        {selectedVideo && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${selectedVideo.gradient} p-6`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  {selectedVideo.icon && <selectedVideo.icon className="w-8 h-8 text-white" />}
                </motion.div>
                <div className="text-white">
                  <p className="text-white/80 text-sm font-medium">MODULO {selectedVideo.moduleNumber}</p>
                  <h3 className="text-2xl font-bold">{selectedVideo.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-white/80">
                      <Clock className="w-4 h-4" />
                      {selectedVideo.duration}
                    </span>
                    {isVideoCompleted(selectedVideo.id) && (
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Concluido
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {selectedVideo.videoUrl ? (
              selectedVideo.videoUrl.includes('youtube') || selectedVideo.videoUrl.includes('vimeo') ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <iframe
                    src={selectedVideo.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <VideoPlayer
                  src={selectedVideo.videoUrl.includes('/uploads/')
                    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${selectedVideo.videoUrl}`
                    : selectedVideo.videoUrl
                  }
                  title={selectedVideo.title}
                  onEnded={() => markAsCompleted(selectedVideo.id)}
                />
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-video rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex flex-col items-center justify-center border-2 border-dashed border-white/[0.08]"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-white/[0.08] flex items-center justify-center mb-4"
                >
                  <Play className="w-10 h-10 text-slate-400" />
                </motion.div>
                <p className="text-slate-300 font-semibold text-lg">Video em breve</p>
                <p className="text-sm text-slate-400">O conteudo estara disponivel em breve</p>
              </motion.div>
            )}

            <div>
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Topicos Abordados
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedVideo.topics.map((topic, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-300">{topic}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedVideo.content && (
              <div className="max-h-96 overflow-y-auto">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Conteudo do Modulo
                </h4>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="prose prose-sm max-w-none">
                    {selectedVideo.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3 first:mt-0">{line.replace('# ', '')}</h2>
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={i} className="text-lg font-semibold text-slate-200 mt-4 mb-2">{line.replace('## ', '')}</h3>
                      }
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="text-base font-semibold text-slate-300 mt-3 mb-2">{line.replace('### ', '')}</h4>
                      }
                      if (line.startsWith('- ')) {
                        return <li key={i} className="text-slate-400 ml-4 mb-1">{line.replace('- ', '')}</li>
                      }
                      if (line.startsWith('- [ ]')) {
                        return <li key={i} className="text-slate-400 ml-4 list-none flex items-center gap-2 mb-1">
                          <span className="w-4 h-4 border-2 border-white/[0.15] rounded" />
                          {line.replace('- [ ] ', '')}
                        </li>
                      }
                      if (line.trim() === '') return <br key={i} />
                      return <p key={i} className="text-slate-400 mb-2">{line}</p>
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {!isVideoCompleted(selectedVideo.id) ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    markAsCompleted(selectedVideo.id)
                    setSelectedVideo(null)
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-200 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar como Concluido
                </motion.button>
              ) : (
                <div className="flex-1 px-6 py-4 bg-emerald-500/15 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Modulo Concluido
                </div>
              )}
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-6 py-4 bg-white/[0.05] text-slate-300 font-semibold rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Material Detail Modal */}
      <Modal
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        title={selectedMaterial?.title}
        size="lg"
      >
        {selectedMaterial && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                {selectedMaterial.icon && <selectedMaterial.icon className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-white">{selectedMaterial.title}</h3>
                <p className="text-sm text-slate-500">{selectedMaterial.description}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full font-bold text-sm ${
                selectedMaterial.type === 'pdf'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-blue-500/15 text-blue-400'
              }`}>
                {selectedMaterial.type.toUpperCase()}
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] font-mono text-sm whitespace-pre-wrap text-slate-300">
                {selectedMaterial.content}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200 transition-all"
              >
                <Download className="w-5 h-5" />
                Baixar {selectedMaterial.type.toUpperCase()}
              </motion.button>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-6 py-4 bg-white/[0.05] text-slate-300 font-semibold rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
