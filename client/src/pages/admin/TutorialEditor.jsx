import { useState } from 'react'
import { motion } from 'framer-motion'
import { trainingVideos, supportMaterials } from '../tutorials/data/trainingData'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import {
  BookOpen,
  Video,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  List,
  Download,
  ChevronRight,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

export default function TutorialEditor() {
  const [previewModal, setPreviewModal] = useState(false)
  const [previewTutorial, setPreviewTutorial] = useState(null)
  const [materialModal, setMaterialModal] = useState(false)
  const [previewMaterial, setPreviewMaterial] = useState(null)
  const [activeTab, setActiveTab] = useState('modules')

  const handlePreview = (tutorial) => {
    setPreviewTutorial(tutorial)
    setPreviewModal(true)
  }

  const handleMaterialPreview = (material) => {
    setPreviewMaterial(material)
    setMaterialModal(true)
  }

  const modulesWithVideo = trainingVideos.filter((t) => t.videoUrl).length
  const modulesWithContent = trainingVideos.filter((t) => t.content).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Conteúdo de Treinamento</h1>
          <p className="text-slate-500 mt-1">Visualize os módulos do programa de treinamento</p>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Conteúdo gerenciado por código</p>
          <p className="text-sm text-amber-700 mt-1">
            Os módulos de treinamento estão definidos em{' '}
            <code className="px-1.5 py-0.5 bg-amber-100 rounded text-xs font-mono">
              src/pages/tutorials/data/trainingData.js
            </code>
            . Para adicionar ou editar módulos, modifique este arquivo diretamente.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{trainingVideos.length}</p>
            <p className="text-xs text-slate-500">Módulos</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-violet-100">
            <Video className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{modulesWithVideo}</p>
            <p className="text-xs text-slate-500">Com vídeo</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-100">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{modulesWithContent}</p>
            <p className="text-xs text-slate-500">Com conteúdo</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-100">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{supportMaterials.length}</p>
            <p className="text-xs text-slate-500">Materiais</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'modules'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Módulos de Treinamento
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Materiais de Apoio
        </button>
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Trilha de Aprendizado</h2>

          <div className="space-y-4">
            {trainingVideos.map((tutorial, index) => {
              const IconComponent = tutorial.icon
              return (
                <div
                  key={tutorial.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tutorial.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        MÓDULO {tutorial.moduleNumber}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800">{tutorial.title}</p>
                    <p className="text-sm text-slate-500 truncate">{tutorial.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {tutorial.duration}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                        <List className="w-4 h-4" />
                        {tutorial.topics?.length || 0} tópicos
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tutorial.videoUrl ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-medium">
                          <Video className="w-3 h-3 mr-1" />
                          Vídeo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-100 text-amber-600 text-xs font-medium">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Sem vídeo
                        </span>
                      )}
                      {tutorial.content && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-100 text-blue-600 text-xs font-medium">
                          <FileText className="w-3 h-3 mr-1" />
                          Texto
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePreview(tutorial)}
                      className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-primary transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Materiais de Apoio</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportMaterials.map((material) => {
              const IconComponent = material.icon
              return (
                <div
                  key={material.id}
                  onClick={() => handleMaterialPreview(material)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 group-hover:text-primary transition-colors">
                      {material.title}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{material.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-200 text-slate-600 text-xs font-medium uppercase">
                      {material.type}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Pré-visualização do Módulo"
        size="xl"
      >
        {previewTutorial && (
          <div className="space-y-6">
            {/* Header */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${previewTutorial.gradient} p-6 text-white`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <previewTutorial.icon className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-sm font-semibold bg-white/20 px-2 py-0.5 rounded">
                    MÓDULO {previewTutorial.moduleNumber}
                  </span>
                  <h2 className="text-2xl font-bold mt-1">{previewTutorial.title}</h2>
                  <p className="text-white/80">{previewTutorial.description}</p>
                </div>
              </div>
            </div>

            {/* Topics */}
            {previewTutorial.topics && previewTutorial.topics.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Tópicos Abordados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {previewTutorial.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Preview */}
            {previewTutorial.content && (
              <div className="bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Conteúdo
                </h3>
                <div className="prose prose-sm prose-slate max-w-none">
                  <pre className="whitespace-pre-wrap text-xs text-slate-600 font-mono bg-white p-4 rounded-lg">
                    {previewTutorial.content.substring(0, 1000)}
                    {previewTutorial.content.length > 1000 && '...'}
                  </pre>
                </div>
              </div>
            )}

            {/* Video Status */}
            <div className={`p-4 rounded-xl ${previewTutorial.videoUrl ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-3">
                <Video className={`w-5 h-5 ${previewTutorial.videoUrl ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div>
                  <p className={`font-medium ${previewTutorial.videoUrl ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {previewTutorial.videoUrl ? 'Vídeo Configurado' : 'Vídeo Pendente'}
                  </p>
                  <p className={`text-sm ${previewTutorial.videoUrl ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {previewTutorial.videoUrl || 'Adicione a URL do vídeo no arquivo trainingData.js'}
                  </p>
                </div>
              </div>
            </div>

            <Button variant="ghost" onClick={() => setPreviewModal(false)} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </Modal>

      {/* Material Preview Modal */}
      <Modal
        isOpen={materialModal}
        onClose={() => setMaterialModal(false)}
        title={previewMaterial?.title || 'Material'}
        size="xl"
      >
        {previewMaterial && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                <previewMaterial.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{previewMaterial.title}</p>
                <p className="text-sm text-slate-500">{previewMaterial.description}</p>
              </div>
            </div>

            {previewMaterial.content && (
              <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                  {previewMaterial.content}
                </pre>
              </div>
            )}

            <Button variant="ghost" onClick={() => setMaterialModal(false)} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
