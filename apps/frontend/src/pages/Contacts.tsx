import { useEffect, useMemo, useRef, useState } from 'react'
import {
    AppBar, Toolbar, Typography, IconButton, Container, InputAdornment,
    Select, MenuItem, ToggleButtonGroup, ToggleButton, Pagination, Stack, Box,
    LinearProgress, Button, Paper, TextField, Divider, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import UploadIcon from '@mui/icons-material/Upload'
import DownloadIcon from '@mui/icons-material/Download'
import SettingsIcon from '@mui/icons-material/Settings'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { useDebounce } from '../lib/useDebounce'
import ContactCard from '../components/ContactCard'
import ContactsMap from "../components/ContactsMap.tsx"
import ContactDialog from '../components/ContactDialog'

type Contact = {
    id: number
    name: string
    cpf: string
    street?: string|null
    number?: string|null
    neighborhood?: string|null
    city?: string|null
    state?: string|null
    lat?: number|null
    lng?: number|null
}

type Page<T> = { data: T[]; total: number; per_page: number; current_page: number }

export default function ContactsPage() {
    const { user, logout } = useAuth()

    const [q, setQ] = useState('')
    const qDeb = useDebounce(q, 400)
    const [sort, setSort] = useState<'name'|'cpf'|'created_at'>('name')
    const [dir, setDir]   = useState<'asc'|'desc'>('asc')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const [rows, setRows] = useState<Contact[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const selected = useMemo(() => rows.find(r => r.id === selectedId) || null, [rows, selectedId])

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage])
    const [openNew, setOpenNew] = useState(false)

    async function fetchData() {
        setLoading(true)
        try {
            const p = new URLSearchParams()
            if (qDeb.trim()) p.set('q', qDeb.trim())
            p.set('sort', sort); p.set('dir', dir)
            p.set('page', String(page)); p.set('per_page', String(perPage))
            const resp = await api.get<Page<Contact>>('/contacts?' + p.toString())
            setRows(resp.data); setTotal(resp.total)
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [qDeb, sort, dir, page, perPage])

    function reset() { setQ(''); setSort('name'); setDir('asc'); setPage(1); setPerPage(10) }

    const listRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!selectedId || !listRef.current) return
        const el = listRef.current.querySelector(`[data-id="${selectedId}"]`)
        if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' })
    }, [selectedId])

    return (
        <Box sx={{ height: '100dvh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar sx={{ gap: 1 }}>
                    <Typography variant="h4" sx={{ flex: 1, fontWeight: 700 }}>Contatos</Typography>

          {/*          <Tooltip title="Importar CSV"><span>*/}
          {/*  <IconButton aria-label="Importar" color="inherit"><UploadIcon /></IconButton>*/}
          {/*</span></Tooltip>*/}

          {/*          <Tooltip title="Exportar CSV"><span>*/}
          {/*  <IconButton aria-label="Exportar" color="inherit"><DownloadIcon /></IconButton>*/}
          {/*</span></Tooltip>*/}

          {/*          <Tooltip title="Configurações"><span>*/}
          {/*  <IconButton aria-label="Configurações" color="inherit"><SettingsIcon /></IconButton>*/}
          {/*</span></Tooltip>*/}

                    <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

                    <Typography color="text.secondary" sx={{ mr: 1 }}>{user?.name}</Typography>
                    <IconButton onClick={logout} aria-label="Sair" color="inherit"><LogoutIcon /></IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth={false} disableGutters sx={{ height: '100%', py: 1, px: 1 }}>
                <Box
                    sx={{
                        height: '100%',
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(380px, 520px) minmax(0, 1fr)' },
                        gap: 1,
                        alignItems: 'stretch'
                    }}
                >
                    <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <TextField
                                value={q}
                                onChange={(e) => { setPage(1); setQ(e.target.value) }}
                                placeholder="Buscar por nome ou CPF"
                                size="small"
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{ borderRadius: 2 }}
                                onClick={()=>setOpenNew(true)}
                            >
                                Novo
                            </Button>
                            <ContactDialog
                                open={openNew}
                                onClose={()=>setOpenNew(false)}
                                onSaved={(created)=>{
                                    fetchData().then(()=>{
                                        setSelectedId(created.id)
                                    })
                                }}
                            />
                        </Stack>

                        {/* Lista de contatos */}
                        { loading && <LinearProgress sx={{ mb: 1 }} />}
                        <Paper sx={{ p: 1, mb: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                <Select size="small" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
                                    <MenuItem value="name">Nome</MenuItem>
                                    <MenuItem value="cpf">CPF</MenuItem>
                                    <MenuItem value="created_at">Criados</MenuItem>
                                </Select>
                                <ToggleButtonGroup size="small" color="primary" exclusive value={dir} onChange={(_, v)=> v && setDir(v)}>
                                    <ToggleButton value="asc">ASC</ToggleButton>
                                    <ToggleButton value="desc">DESC</ToggleButton>
                                </ToggleButtonGroup>
                                <Select size="small" value={perPage} onChange={(e)=>{ setPerPage(Number(e.target.value)); setPage(1) }}>
                                    {[5,10,20,50].map(n => <MenuItem key={n} value={n}>{n}/pág</MenuItem>)}
                                </Select>
                                <Button size="small" startIcon={<RefreshIcon />} onClick={fetchData}>Atualizar</Button>
                                <Button size="small" onClick={reset}>Limpar</Button>
                            </Stack>
                            <Box ref={listRef} padding='12' sx={{ overflow: 'auto', pr: 0.5}}>
                                {rows.length === 0 && !loading && (
                                    <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Nenhum contato encontrado.</Paper>
                                )}

                                <Stack spacing={1}>
                                    {rows.map((c) => (
                                        <Box key={c.id} data-id={c.id}>
                                            <ContactCard
                                                name={c.name}
                                                subtitle={[c.street, c.number, c.neighborhood, c.city, c.state].filter(Boolean).join(', ')}
                                                selected={c.id === selectedId}
                                                onClick={() => setSelectedId(c.id)}
                                            />
                                        </Box>
                                    ))}
                                </Stack>

                                <Stack direction="row" justifyContent="center" sx={{ py: 1.5 }}>
                                    <Pagination
                                        page={page}
                                        count={totalPages}
                                        onChange={(_, p)=>setPage(p)}
                                        color="primary"
                                    />
                                </Stack>
                            </Box>
                        </Paper>

                        {loading && <LinearProgress sx={{ mb: 1 }} />}

                    </Box>

                    {/* Mapa dos contatos */}
                    <Box sx={{ height: '100%'}}>
                        <Paper sx={{ p: 1, height: '100%', borderRadius: 2 }}>
                            <Box sx={{ height: 'calc(100% - 32px)', borderRadius: 2, overflow: 'hidden' }}>
                                <ContactsMap
                                    contacts={rows}
                                    focus={selected && typeof selected.lat === 'number' && typeof selected.lng === 'number'
                                        ? { id: selected.id, name: selected.name, lat: selected.lat!, lng: selected.lng! }
                                        : null
                                    }
                                    height="100%"
                                    width="100%"

                                />
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
