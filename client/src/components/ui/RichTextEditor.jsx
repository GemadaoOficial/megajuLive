import { useState, useRef, useCallback } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
} from 'lucide-react'

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? 'bg-primary text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1" />

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Escreva aqui...',
  minHeight = '200px',
}) {
  const editorRef = useRef(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleChange()
  }, [])

  const handleChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleKeyDown = (e) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault()
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
  }

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl)
      setLinkUrl('')
      setShowLinkModal(false)
    }
  }

  const formatBlock = (tag) => {
    execCommand('formatBlock', tag)
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        {/* Text Style */}
        <ToolbarButton onClick={() => formatBlock('p')} title="Paragrafo">
          <Type className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h1')} title="Titulo 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h2')} title="Titulo 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h3')} title="Titulo 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text Format */}
        <ToolbarButton onClick={() => execCommand('bold')} title="Negrito">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italico">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Sublinhado">
          <Underline className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Alinhar a esquerda">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Centralizar">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('justifyRight')} title="Alinhar a direita">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Lista">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Lista numerada">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('blockquote')} title="Citacao">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('pre')} title="Codigo">
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton onClick={() => setShowLinkModal(true)} title="Inserir link">
          <Link className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => execCommand('undo')} title="Desfazer">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('redo')} title="Refazer">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        className="p-4 outline-hidden prose prose-slate max-w-none"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Inserir Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-orange-500 transition-colors"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94A3B8;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
        [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        [contenteditable] p { margin-bottom: 0.5rem; }
        [contenteditable] ul, [contenteditable] ol { margin-left: 1.5rem; margin-bottom: 0.5rem; }
        [contenteditable] blockquote {
          border-left: 4px solid #EE4D2D;
          padding-left: 1rem;
          font-style: italic;
          color: #64748B;
          margin: 1rem 0;
        }
        [contenteditable] pre {
          background: #1E293B;
          color: #F8FAFC;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          overflow-x: auto;
        }
        [contenteditable] a {
          color: #EE4D2D;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
