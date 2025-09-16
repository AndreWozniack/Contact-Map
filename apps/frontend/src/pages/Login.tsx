import { useState } from 'react';
import {
    Alert, Box, Button, Container, Stack, TextField, Typography, Link, CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Center from "../components/Center.tsx";

export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const location = useLocation() as any;
    const from = location.state?.from?.pathname ?? '/contacts';

    const [email, setEmail] = useState('');
    const [password, setPwd] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
            await login(email, password);
            nav(from, { replace: true });
        } catch (e: any) {
            setErr(e?.detail?.message || 'Credenciais inválidas');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Center>
            <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
                <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>Entrar</Typography>
                            <Typography color="text.secondary">Acesse sua conta para gerenciar contatos</Typography>
                        </Box>

                        {err && <Alert severity="error">{err}</Alert>}

                        <TextField
                            label="E-mail"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Senha"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPwd(e.target.value)}
                            required
                        />

                        <Button type="submit" variant="contained" size="large" disabled={loading}>
                            {loading ? <CircularProgress size={22} /> : 'Entrar'}
                        </Button>

                        <Stack direction="row" justifyContent="space-between">
                            <Link href="#" underline="hover">Esqueci minha senha</Link>
                            <Link href="/register" underline="hover">Criar conta</Link>
                        </Stack>
                    </Stack>
                </Box>
            </Container>
        </Center>
    );
}
