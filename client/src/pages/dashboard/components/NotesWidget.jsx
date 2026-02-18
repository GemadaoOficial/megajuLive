import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { StickyNote, Loader2, Check } from 'lucide-react'
import { notesAPI } from '../../../services/api'

export default function NotesWidget() {
  const [note, setNote] = useState(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef(null)
  const savedTimeoutRef = useRef(null)

  useEffect(() => {
    loadNotes()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const loadNotes = async () => {
    try {
      const response = await notesAPI.getAll()
      const notes = response.data.notes || []
      if (notes.length > 0) {
        setNote(notes[0])
        setContent(notes[0].content || '')
      } else {
        // Auto-create a note if none exists
        const createResponse = await notesAPI.create({ content: '' })
        const created = createResponse.data.note
        setNote(created)
        setContent('')
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    }
  }

  const saveNote = useCallback(async (text) => {
    if (!note) return
    setSaving(true)
    setSaved(false)
    try {
      await notesAPI.update(note.id, { content: text })
      setSaving(false)
      setSaved(true)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
      setSaving(false)
    }
  }, [note])

  const handleChange = (e) => {
    const text = e.target.value
    setContent(text)
    setSaved(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveNote(text)
    }, 1000)
  }

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    saveNote(content)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Lembretes</h2>
          </div>

          {/* Save status indicator */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {saving && (
              <span className="flex items-center gap-1 text-amber-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Salvando...
              </span>
            )}
            {saved && !saving && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                Salvo
              </span>
            )}
          </div>
        </div>

        <textarea
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={"Escreva seus lembretes aqui...\n\nEx: Nao falar sobre desconto de concorrente\nLembrar de mostrar produto X..."}
          className="w-full h-40 bg-transparent text-slate-200 placeholder-amber-400/40 text-sm leading-relaxed resize-none outline-none"
        />
      </div>
    </motion.div>
  )
}
