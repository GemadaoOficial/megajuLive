import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function Pagination({ page, totalPages, onPageChange, hasMore, total }) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
      <span className="text-sm text-slate-500">
        Pagina {page} de {totalPages} ({total} itens)
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
        >
          Proxima
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
