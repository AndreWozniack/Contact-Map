import { AppBar, Toolbar, Typography, IconButton, Divider } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from "../hooks/useAuth";

export default function ContactsHeader() {
    const { user, logout } = useAuth()

    return (
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar sx={{ gap: 1 }}>
                <Typography variant="h4" sx={{ flex: 1, fontWeight: 700 }}>
                    Contatos
                </Typography>

                <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

                <Typography color="text.secondary" sx={{ mr: 1 }}>
                    {user?.name}
                </Typography>
                <IconButton onClick={logout} aria-label="Sair" color="inherit">
                    <LogoutIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}
