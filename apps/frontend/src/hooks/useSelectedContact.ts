import { useMemo, useRef, useEffect, useState } from 'react'
import type { Contact } from '../types'

/**
 * Hook para gerenciamento de contato selecionado
 * 
 * Gerencia a seleção de contatos em uma lista, incluindo:
 * - Estado do contato atualmente selecionado
 * - Scroll automático para o contato selecionado
 * - Limpeza da seleção ao clicar fora ou pressionar Escape
 * - Referência para o container da lista
 * 
 * @param rows Lista de contatos disponíveis
 * @returns Objeto com estado e funções de seleção
 */
export function useSelectedContact(rows: Contact[]) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = useMemo(
    () => rows.find(r => r.id === selectedId) || null,
    [rows, selectedId]
  )

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedId || !listRef.current) return
    const el = listRef.current.querySelector(`[data-id="${selectedId}"]`)
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const onClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement
      if (!target.closest('[data-id]')) setSelectedId(null)
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setSelectedId(null)
    }

    el.addEventListener('click', onClick)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      el.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return { 
    selectedId, 
    setSelectedId, 
    selected, 
    listRef 
  }
}
