import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  FileVideo,
} from 'lucide-react'
import api from '../../services/api'

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function VideoUploader({
  onUploadComplete,
  currentVideo = null,
  onRemove,
  maxSize = 500, // MB
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    setError(null)

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setError('Formato nao suportado. Use MP4, WebM, OGG ou MOV.')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`O arquivo excede o limite de ${maxSize}MB`)
      return
    }

    // Upload file
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await api.post('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percent)
        },
      })

      onUploadComplete?.(response.data.videoUrl, {
        filename: response.data.filename,
        originalName: response.data.originalName,
        size: response.data.size,
      })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Erro ao fazer upload do video')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = async () => {
    if (currentVideo && onRemove) {
      try {
        // Extract filename from URL
        const filename = currentVideo.split('/').pop()
        await api.delete(`/upload/video/${filename}`)
      } catch (err) {
        console.error('Delete error:', err)
      }
      onRemove()
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Video Preview */}
      {currentVideo && (
        <div className="relative rounded-xl overflow-hidden bg-slate-900">
          <video
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${currentVideo}`}
            className="w-full aspect-video"
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!currentVideo && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            scale: isDragging ? 1.02 : 1,
            borderColor: isDragging ? '#EE4D2D' : '#E2E8F0',
          }}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
            isDragging ? 'bg-primary/5 border-primary' : 'bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-slate-600 font-medium mb-2">Enviando video...</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <p className="text-sm text-slate-500">{progress}%</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-700 font-medium mb-1">
                  Arraste um video aqui ou clique para selecionar
                </p>
                <p className="text-sm text-slate-500">
                  MP4, WebM, OGG ou MOV (max. {maxSize}MB)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
