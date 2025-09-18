import { alpha } from '@mui/material/styles'
import { Avatar, Box, Stack, Typography, Paper, IconButton, Menu, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import React, { useState } from 'react'
import type { Contact } from '../../types'

type Props = {
    name: string
    subtitle?: string
    selected?: boolean
    contact?: Contact
    onCopy?: (contact: Contact) => void
    onEdit?: (contact: Contact) => void
    onDelete?: (contact: Contact) => void
    onClick?: () => void
}

/**
 * Componente de card de contato
 * 
 * Exibe as informações básicas de um contato em formato de card,
 * incluindo avatar com inicial, nome, subtítulo e menu de ações.
 * Suporta estados de seleção e interações hover.
 * 
 * @param props Propriedades do componente
 * @returns Card estilizado com informações do contato
 */
export default function ContactCard({ name, subtitle, selected, contact, onCopy, onEdit, onDelete, onClick }: Props) {
    const initial = (name || '?').trim().charAt(0).toUpperCase()
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        setAnchorEl(e.currentTarget)
    }
    
    const handleMenuClose = () => setAnchorEl(null)

    return (
        <Paper
            onClick={onClick}
            variant="outlined"
            sx={(t) => ({
                p: 1.25,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: alpha(t.palette.primary.light, 0.08),
                borderColor: selected ? t.palette.primary.main : undefined,
                transition: 'background-color .15s, box-shadow .15s, border-color .15s',
                '&:hover': {
                    boxShadow: 1,
                    bgcolor: alpha(t.palette.primary.light, 0.14),
                },
            })}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#6750A4', 0.2), color: '#6750A4', width: 36, height: 36 }}>
                    {initial}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap fontWeight={600}>{name}</Typography>
                    {subtitle && (
                        <Typography noWrap variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={handleMenuOpen}
                        sx={{ ml: 'auto' }}
                        aria-label="Mais ações"
                        aria-haspopup="menu"
                        aria-controls={open ? 'contact-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                >
                    <MoreVertIcon />
                </IconButton>
            </Stack>
            <Menu id="contact-menu" anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                <MenuItem onClick={() => { handleMenuClose(); if (contact) onCopy?.(contact) }}>Copiar</MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); if (contact) onEdit?.(contact) }}>Editar</MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); if (contact) onDelete?.(contact) }}>Apagar</MenuItem>

            </Menu>
        </Paper>
    )
}
