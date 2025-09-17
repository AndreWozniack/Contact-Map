import { useState } from 'react'
import type { Contact } from '../types'

/**
 * Hook para gerenciar funcionalidades da área de transferência
 * 
 * Fornece funcionalidades para copiar informações de contatos para a área de transferência
 * e gerenciar o estado de feedback visual (snackbar) da operação.
 * 
 * @returns Objeto com funções e estados relacionados ao clipboard
 */
export function useClipboard() {
  const [copiedOpen, setCopiedOpen] = useState(false)

  /**
   * Copia as informações de um contato para a área de transferência
   * 
   * Formata os dados do contato em texto legível e copia para o clipboard.
   * Automaticamente abre o snackbar de confirmação.
   * 
   * @param c Objeto de contato a ser copiado
   */
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