import { Box } from '@mui/material'
import type { ReactNode } from 'react'

/**
 * Props do componente Center
 */
type Props = { 
    /** Componentes filhos a serem centralizados */
    children: ReactNode
    /** Largura máxima do container (padrão: 1000px) */
    maxWidth?: number 
}

/**
 * Componente de centralização
 * 
 * Centraliza conteúdo tanto horizontal quanto verticalmente na tela,
 * útil para páginas de login, erro ou conteúdo que deve ficar no meio da viewport.
 * 
 * @param children Conteúdo a ser centralizado
 * @param maxWidth Largura máxima do container em pixels
 * @returns Container centralizado
 */
export default function Center({ children, maxWidth = 1000 }: Props) {
    return (
        <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', px: 2 }}>
            <Box sx={{ width: '100%', maxWidth, mx: 'auto' }}>
                {children}
            </Box>
        </Box>
    )
}
