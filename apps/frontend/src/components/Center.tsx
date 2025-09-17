import { Box } from '@mui/material'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; maxWidth?: number }
export default function Center({ children, maxWidth = 1000 }: Props) {
    return (
        <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', px: 2 }}>
            <Box sx={{ width: '100%', maxWidth, mx: 'auto' }}>
                {children}
            </Box>
        </Box>
    )
}
