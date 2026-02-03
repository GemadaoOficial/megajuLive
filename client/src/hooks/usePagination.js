import { useState, useCallback } from 'react'

export function usePagination({ initialPage = 1, initialLimit = 10 } = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const nextPage = useCallback(() => setPage((p) => p + 1), [])
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])
  const reset = useCallback(() => setPage(1), [])
  const goToPage = useCallback((newPage) => setPage(Math.max(1, newPage)), [])

  return { page, limit, setPage: goToPage, setLimit, nextPage, prevPage, reset }
}
