import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useDebounce } from '../lib/useDebounce'
import type { Contact, Page } from '../types'

type SortField = 'name' | 'cpf' | 'created_at'
type SortDir = 'asc' | 'desc'

/**
 * Hook para gerenciamento de lista de contatos
 * 
 * Fornece funcionalidades completas para gerenciar a lista de contatos, incluindo:
 * - Busca com debounce
 * - Ordenação por diferentes campos
 * - Paginação
 * - Estado de carregamento
 * - Refresh de dados
 * 
 * @returns Objeto com estados e funções para gerenciar contatos
 */
export function useContacts() {
  const [q, setQ] = useState('')
  const qDeb = useDebounce(q, 400) // Busca com debounce
  const [sort, setSort] = useState<SortField>('name')
  const [dir, setDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [rows, setRows] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (qDeb.trim()) p.set('q', qDeb.trim())
      p.set('sort', sort); p.set('dir', dir)
      p.set('page', String(page)); p.set('per_page', String(perPage))
      const resp = await api.get<Page<Contact>>('/contacts?' + p.toString())
      setRows(resp.data); setTotal(resp.total)
    } finally { setLoading(false) }
  }, [qDeb, sort, dir, page, perPage])

  useEffect(() => { fetchData() }, [fetchData])

  function reset() {
    setQ(''); setSort('name'); setDir('asc'); setPage(1); setPerPage(10)
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return {
    q, setQ, sort, setSort, dir, setDir, page, setPage, perPage, setPerPage,
    rows, setRows, total, totalPages, loading,
    fetchData, reset,
  }
}