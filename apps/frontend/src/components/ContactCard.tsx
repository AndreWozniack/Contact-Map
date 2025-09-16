import { alpha } from '@mui/material/styles'
import { Avatar, Box, Stack, Typography, Paper } from '@mui/material'

type Props = {
    name: string
    subtitle?: string
    selected?: boolean
    onClick?: () => void
}

export default function ContactCard({ name, subtitle, selected, onClick }: Props) {
    const initial = (name || '?').trim().charAt(0).toUpperCase()

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
            </Stack>
        </Paper>
    )
}
