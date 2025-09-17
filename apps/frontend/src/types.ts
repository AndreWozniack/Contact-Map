/**
 * Definições de tipos para a aplicação
 */

/**
 * Representa um contato no sistema
 */
export type Contact = {
    id: number
    name: string
    cpf: string
    street: string
    number?: string | null
    neighborhood?: string | null
    city: string 
    state: string
    lat: number
    lng: number
    complement?: string | null
    cep: string
    phone: string
}

/**
 * Estrutura de paginação para listas de dados
 */
export type Page<T> = { 
    data: T[]
    total: number
    per_page: number
    current_page: number 
}
