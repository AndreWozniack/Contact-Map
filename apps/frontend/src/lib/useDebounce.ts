import { useEffect, useState } from 'react'

/**
 * Hook de debounce
 * 
 * Atrasa a atualização de um valor até que pare de mudar por um período específico.
 * 
 * @param value Valor a ser debounced
 * @param delay Tempo de delay em milissegundos (padrão: 400ms)
 * @returns Valor debounced que só atualiza após o delay
 */
export function useDebounce<T>(value: T, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    
    useEffect(() => { 
        const timeoutId = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timeoutId)
    }, [value, delay])
    
    return debouncedValue
}
