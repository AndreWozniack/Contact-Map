import { useMemo, useRef, useEffect, useState } from 'react'
import type { Contact } from '../types'

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

  return { selectedId, setSelectedId, selected, listRef }
}