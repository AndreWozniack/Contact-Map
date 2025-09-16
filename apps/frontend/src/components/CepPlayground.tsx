import { useState } from 'react'
import { Alert, Button, Grid as Grid, Stack, TextField } from '@mui/material'
import { api } from '../lib/api.ts'

type CepResult = {
    cep?: string
    street?: string
    neighborhood?: string
    city?: string
    state?: string
    lat?: number|null
    lng?: number|null
}

export default function CepPlayground() {
    const [cep, setCep] = useState('')
    const [res, setRes] = useState<CepResult | null>(null)
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSearch() {
        setErr(null); setRes(null); setLoading(true)
        try {
            // dependendo de como você implementou no backend, pode ser ?cep= ou ?q=
            const r = await api.get<CepResult>('/address/search?cep=' + encodeURIComponent(cep))
            setRes(r)
        } catch (e: any) {
            setErr(e?.detail?.message || 'Não foi possível buscar o CEP')
        } finally { setLoading(false) }
    }

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
                <TextField label="CEP" value={cep} onChange={(e)=>setCep(e.target.value)} sx={{ maxWidth: 240 }} />
                <Button variant="contained" onClick={onSearch} disabled={loading}>Buscar</Button>
            </Stack>

            {err && <Alert severity="error">{err}</Alert>}

            {res && (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Logradouro" value={res.street || ''} fullWidth disabled />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Bairro" value={res.neighborhood || ''} fullWidth disabled />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField label="Cidade" value={res.city || ''} fullWidth disabled />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                        <TextField label="UF" value={res.state || ''} fullWidth disabled />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField label="Lat" value={res.lat ?? ''} fullWidth disabled />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField label="Lng" value={res.lng ?? ''} fullWidth disabled />
                    </Grid>
                </Grid>
            )}
        </Stack>
    )
}
