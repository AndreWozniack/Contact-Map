import { useEffect, useRef, useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Stack, Button, MenuItem, InputAdornment, CircularProgress
} from '@mui/material'
import { api } from '../lib/api'
import { maskCPF, maskCEP, maskPhone, onlyDigits } from '../lib/masks'
import AddressAutocomplete from './AddressAutocomplete'

type Props = {
    open: boolean
    onClose: () => void
    onSaved: (created: any) => void
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RO','RS','RR','SC','SP','SE','TO']

export default function ContactDialog({ open, onClose, onSaved }: Props){
    const [submitting, setSubmitting] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)

    const [f, setF] = useState({
        name:'', cpf:'', phone:'',
        cep:'', state:'PR', city:'', street:'',
        number:'', complement:''
    })
    const [err, setErr] = useState<Record<string,string>>({})
    const numberRef = useRef<HTMLInputElement>(null)

    function set<K extends keyof typeof f>(k: K, v: string){
        setF(s => ({ ...s, [k]: v }))
    }

    function resetAll() {
        setF({
            name:'', cpf:'', phone:'',
            cep:'', state:'PR', city:'', street:'',
            number:'', complement:''
        })
        setErr({})
    }

    useEffect(() => {
        const digits = onlyDigits(f.cep)

        if (digits.length !== 8) {
            setCepLoading(false)
            return
        }

        let cancelled = false
        ;(async () => {
            try {
                setCepLoading(true)
                const resp = await api.get<{ address: {
                        cep: string; state: string; city: string; street: string; district?: string;
                    } }>(`/address?cep=${digits}`)

                if (cancelled) return
                const a = resp.address

                setErr(prev => ({ ...prev, cep: '' }))
                setF(s => ({
                    ...s,
                    state: a.state || s.state,
                    city:  a.city  || s.city,
                    street: a.street || s.street,
                    complement: s.complement || a.district || '',
                    cep: maskCEP(a.cep || digits),
                }))
            } catch {
                if (!cancelled) setErr(prev => ({ ...prev, cep: 'CEP não encontrado' }))
            } finally {
                if (!cancelled) setCepLoading(false)
            }
        })()

        return () => { cancelled = true }
    }, [f.cep])


    async function handleSubmit(){
        setSubmitting(true); setErr({})
        try {
            const payload = {
                ...f,
                cpf:   onlyDigits(f.cpf),
                cep:   onlyDigits(f.cep),
                phone: onlyDigits(f.phone),
            }
            const created = await api.post('/contacts', payload)
            onSaved(created)
            resetAll()
            onClose()
        } catch (e: any) {
            const detail = e?.detail
            const bag = detail?.errors || {}
            const flat: Record<string,string> = {}
            Object.keys(bag).forEach(k => flat[k] = String(bag[k][0]))
            setErr(Object.keys(flat).length ? flat : { name: 'Erro ao salvar. Tente novamente.' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={() => { resetAll(); onClose() }} fullWidth maxWidth="sm">
            <DialogTitle>Novo contato</DialogTitle>

            <DialogContent>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                    <TextField
                        label="Nome"
                        value={f.name}
                        onChange={e=>set('name', e.target.value)}
                        error={!!err.name}
                        helperText={err.name}
                        autoFocus
                    />

                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
                        <TextField
                            label="CPF"
                            value={f.cpf}
                            onChange={e=>set('cpf', maskCPF(e.target.value))}
                            error={!!err.cpf} helperText={err.cpf}
                            fullWidth
                            inputMode="numeric"
                        />
                        <TextField
                            label="Telefone"
                            value={f.phone}
                            onChange={e=>set('phone', maskPhone(e.target.value))}
                            error={!!err.phone} helperText={err.phone}
                            fullWidth
                            inputMode="tel"
                        />
                    </Stack>

                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
                        <TextField
                            label="CEP"
                            value={f.cep}
                            onChange={e=>set('cep', maskCEP(e.target.value))}
                            error={!!err.cep} helperText={err.cep}
                            fullWidth
                            inputMode="numeric"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {cepLoading && <CircularProgress size={18} />}
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            select
                            label="UF"
                            value={f.state}
                            onChange={e=>set('state', e.target.value)}
                            error={!!err.state} helperText={err.state}
                            sx={{ minWidth: 120 }}
                        >
                            {UFS.map(uf => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
                        </TextField>
                        <TextField
                            label="Cidade"
                            value={f.city}
                            onChange={e=>set('city', e.target.value)}
                            error={!!err.city} helperText={err.city}
                            fullWidth
                        />
                    </Stack>

                    <AddressAutocomplete
                        uf={f.state}
                        city={f.city}
                        value={f.street}
                        onChange={(v)=>set('street', v)}
                        onPick={(it) => {
                            setF(s => ({
                                ...s,
                                street: it.street || s.street,
                                city:   it.city   || s.city,
                                state:  it.state  || s.state,
                                cep:    it.cep    ? maskCEP(it.cep) : s.cep,
                                complement: s.complement || it.district || s.complement
                            }))
                            setTimeout(()=>numberRef.current?.focus(), 0)
                        }}
                        label="Rua (autocomplete)"
                        autoPickFirst
                    />

                    <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
                        <TextField
                            label="Número"
                            value={f.number}
                            onChange={e=>set('number', e.target.value)}
                            error={!!err.number} helperText={err.number}
                            inputRef={numberRef}
                            sx={{ width: { xs:'100%', sm: 180 } }}
                        />
                        <TextField
                            label="Complemento / Bairro"
                            value={f.complement}
                            onChange={e=>set('complement', e.target.value)}
                            error={!!err.complement} helperText={err.complement}
                            fullWidth
                        />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => { resetAll(); onClose() }}>Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting || !f.name || !f.cpf || !f.phone || !f.cep || !f.state || !f.city || !f.street || !f.number}
                >
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    )
}