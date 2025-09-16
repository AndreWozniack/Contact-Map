import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

export default function ContactsPage() {
    const { user, logout } = useAuth();

    return (
        <Box>
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flex: 1 }}>Contatos</Typography>
                    <Typography sx={{ mr: 2 }} color="text.secondary">{user?.name}</Typography>
                    <IconButton onClick={logout} aria-label="Sair"><Logout /></IconButton>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    (em seguida vamos trazer a lista da API e o mapa)
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>Novo contato</Button>
            </Container>
        </Box>
    );
}
