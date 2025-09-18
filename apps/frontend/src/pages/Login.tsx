import { useState } from 'react';
import {
    Alert, Box, Button, Container, Stack, TextField, Typography, Link, CircularProgress
} from '@mui/material';
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from 'react-router-dom';
import Center from "../components/ui/Center.tsx";

/**
 * Página de Login
 * 
 * Permite que usuários façam login na aplicação usando email e senha.
 * Após login bem-sucedido, redireciona para a página que o usuário tentava acessar
 * ou para a página de contatos por padrão.
 * 
 * @returns Componente da página de login
 */
export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname ?? '/contacts';
    const [email, setEmail] = useState('');
    const [password, setPwd] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Manipula o envio do formulário de login
     * 
     * @param e Evento do formulário
     */
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        
        try {
            await login(email, password);
            nav(from, { replace: true });
        } catch (e: unknown) {
            const error = e as { detail?: { message?: string } };
            if (error?.detail?.message === 'Invalid credentials') {
                setErr('Credenciais inválidas');
            } else if (error?.detail?.message === 'These credentials do not match our records.') {
                setErr('Essas credenciais não correspondem aos nossos registros.');
            } else {
                setErr('Não foi possível fazer login');
            }
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
                            <Link href="/forgot-password" underline="hover">Esqueci minha senha</Link>
                            <Link href="/register" underline="hover">Criar conta</Link>
                        </Stack>
                    </Stack>
                </Box>
            </Container>
        </Center>
    );
}
