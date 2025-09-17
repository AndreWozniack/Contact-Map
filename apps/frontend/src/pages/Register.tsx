import { useState } from 'react'
import { Alert, Box, Button, Stack, TextField, Typography, CircularProgress, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from "../hooks/useAuth";
import Center from "../components/Center.tsx";
import type { User } from "../contexts/auth-context";

export default function RegisterPage() {
    const nav = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function upd<K extends keyof typeof form>(k: K, v: string) { setForm({ ...form, [k]: v }) }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErr(null); setLoading(true)
        try {
            const r = await api.post<{ token: string; user: User }>('/register', form, false)
            localStorage.setItem('token', r.token)
            await login(form.email, form.password) // garante contexto preenchido
            nav('/contacts', { replace: true })
        } catch (e: unknown) {
            const error = e as { detail?: { message?: string } };
            setErr(error?.detail?.message || 'Falha ao criar conta');
        } finally { setLoading(false) }
    }

    return (
        <Center>
            <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Typography variant="h4" fontWeight={700}>Criar conta</Typography>
                    {err && <Alert severity="error">{err}</Alert>}
                    <TextField label="Nome" value={form.name} onChange={e => upd('name', e.target.value)} required />
                    <TextField label="E-mail" type="email" value={form.email} onChange={e => upd('email', e.target.value)} required />
                    <TextField label="Senha" type="password" value={form.password} onChange={e => upd('password', e.target.value)} required />
                    <TextField label="Confirmar senha" type="password" value={form.password_confirmation} onChange={e => upd('password_confirmation', e.target.value)} required />
                    <Button type="submit" variant="contained" size="large" disabled={loading}>
                        {loading ? <CircularProgress size={22} /> : 'Criar conta'}
                    </Button>
                    <Link href="/login" underline="hover">Já tenho conta</Link>
                </Stack>
            </Box>
        </Center>
    )
}
