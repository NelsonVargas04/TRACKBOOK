import { useState } from 'react'

export function usePagination(totalItems: number, perPage: number) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const clampedPage = Math.min(page, totalPages)

  function slice<T>(items: T[]): T[] {
    return items.slice((clampedPage - 1) * perPage, clampedPage * perPage)
  }

  return {
    page: clampedPage,
    totalPages,
    setPage,
    slice,
    rangeStart: (clampedPage - 1) * perPage + 1,
    rangeEnd: Math.min(clampedPage * perPage, totalItems),
  }
}
