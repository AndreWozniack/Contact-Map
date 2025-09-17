import { useMemo, useState } from 'react'
import { Alert, Box, Button, Stack, TextField, Typography, CircularProgress, Link } from '@mui/material'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import Center from "../components/Center.tsx";

export default function ResetPasswordPage() {
    const nav = useNavigate()
    const { token = '' } = useParams()
    const [sp] = useSearchParams()
    const email = useMemo(() => sp.get('email') || '', [sp])
    const [password, setPass] = useState('')
    const [password_confirmation, setConf] = useState('')
    const [err, setErr] = useState<string | null>(null)
    const [ok, setOk] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErr(null); setOk(null); setLoading(true)
        try {
            await api.post('/reset-password', { token, email, password, password_confirmation }, false)
            setOk('Senha alterada com sucesso!')
            setTimeout(() => nav('/login', { replace: true }), 800)
        } catch (e: unknown) {
            const error = e as { detail?: { message?: string } };
            setErr(error?.detail?.message || 'Não foi possível redefinir a senha');
        } finally { setLoading(false) }
    }

    return (
        <Center>
            <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Typography variant="h4" fontWeight={700}>Definir nova senha</Typography>
                    {ok && <Alert severity="success">{ok}</Alert>}
                    {err && <Alert severity="error">{err}</Alert>}
                    <TextField label="E-mail" type="email" value={email} disabled />
                    <TextField label="Nova senha" type="password" value={password} onChange={e=>setPass(e.target.value)} required />
                    <TextField label="Confirmar senha" type="password" value={password_confirmation} onChange={e=>setConf(e.target.value)} required />
                    <Button type="submit" variant="contained" size="large" disabled={loading}>
                        {loading ? <CircularProgress size={22} /> : 'Redefinir senha'}
                    </Button>
                    <Link href="/login" underline="hover">Voltar ao login</Link>
                </Stack>
            </Box>
        </Center>
    )
}
