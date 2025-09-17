import { useState } from 'react'
import type { Contact } from '../types'

export function useClipboard() {
  const [copiedOpen, setCopiedOpen] = useState(false)

  function copyContact(c: Contact) {
    const texto = [
      `Nome: ${c.name}`,
      `CPF: ${c.cpf}`,
      c.city && c.state ? `Cidade/UF: ${c.city}/${c.state}` : null,
      (c.street || c.number) ? `Endereço: ${c.street ?? ''} ${c.number ?? ''}`.trim() : null,
      c.lat != null && c.lng != null ? `Coordenadas: ${c.lat}, ${c.lng}` : null,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(texto).then(() => setCopiedOpen(true))
  }

  return {
    copiedOpen,
    closeSnackbar: () => setCopiedOpen(false),
    copyContact,
  }
}