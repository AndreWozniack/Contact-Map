import { useState } from 'react'
import { Alert, Box, Button, Stack, TextField, Typography, CircularProgress, Link } from '@mui/material'
import { api } from '../lib/api'
import Center from "../components/Center.tsx";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [ok, setOk] = useState<string | null>(null)
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErr(null); setOk(null); setLoading(true)
        try {
            await api.post('/forgot-password', { email }, false)
            setOk('Enviamos um e-mail com as instruções para redefinir sua senha.')
        } catch (e: unknown) {
            const error = e as { detail?: { message?: string } };
            setErr(error?.detail?.message || 'Não foi possível enviar o e-mail');
        } finally { setLoading(false) }
    }

    return (
        <Center>
            <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Typography variant="h4" fontWeight={700}>Recuperar senha</Typography>
                    {ok && <Alert severity="success">{ok}</Alert>}
                    {err && <Alert severity="error">{err}</Alert>}
                    <TextField label="E-mail" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                    <Button type="submit" variant="contained" size="large" disabled={loading}>
                        {loading ? <CircularProgress size={22} /> : 'Enviar link'}
                    </Button>
                    <Link href="/login" underline="hover">Voltar ao login</Link>
                </Stack>
            </Box>
        </Center>
    )
}
