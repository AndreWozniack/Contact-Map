import { useEffect, useRef, useState, useCallback } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Stack, Button, MenuItem, InputAdornment, CircularProgress
} from '@mui/material'
import { api } from '../lib/api'
import { maskCPF, maskCEP, maskPhone, onlyDigits } from '../lib/masks'
import { useDebounce } from '../lib/useDebounce'
import AddressAutocomplete from './AddressAutocomplete'
import type { Contact } from '../types'

type Props = {
    open: boolean
    contact: Contact | null
    onClose: () => void
    onSaved: (contact: Contact) => void
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RO','RS','RR','SC','SP','SE','TO']

export default function ContactDialog({ open, contact, onClose, onSaved }: Props){
    const [submitting, setSubmitting] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)

    const [f, setF] = useState({
        name:'', cpf:'', phone:'',
        cep:'', state:'PR', city:'', street:'',
        number:'', complement:''
    })

    const [err, setErr] = useState<Record<string,string>>({})
    const numberRef = useRef<HTMLInputElement>(null)
    const lastFetchedCepRef = useRef<string>('')

    const isEdit = !!contact

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
        if (!open) return
        
        // Resetar o controle de CEP quando abrir o dialog
        lastFetchedCepRef.current = ''
        
        if (!contact) {
            setF({
                name:'', cpf:'', phone:'',
                cep:'', state:'PR', city:'', street:'',
                number:'', complement:''
            })
            setErr({})
            return
        }
        setF({
            name: contact.name,
            cpf: maskCPF(contact.cpf),
            phone: maskPhone(contact.phone || ''),
            cep: maskCEP(contact.cep || ''),
            state: contact.state || 'PR',
            city: contact.city || '',
            street: contact.street || '',
            number: contact.number || '',
            complement: contact.complement || ''
        })
        setErr({})
    }, [open, contact])

    // Debounce do CEP para evitar muitas requisições
    const debouncedCep = useDebounce(f.cep, 500)

    const fetchCEP = useCallback(async (cep: string) => {
        setCepLoading(true)
        lastFetchedCepRef.current = cep
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const data = await response.json()
            
            if (!data.erro) {
                setF(prev => ({
                    ...prev,
                    street: data.logradouro || prev.street,
                    city: data.localidade || prev.city,
                    state: data.uf || prev.state,
                    complement: prev.complement || data.bairro || prev.complement
                }))
                // Focar no campo número apenas se os dados foram preenchidos e for um novo contato
                if (data.logradouro && !isEdit) {
                    setTimeout(() => numberRef.current?.focus(), 100)
                }
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error)
        } finally {
            setCepLoading(false)
        }
    }, [isEdit])

    // Buscar CEP automaticamente quando estiver completo (8 dígitos)
    useEffect(() => {
        const cepDigits = onlyDigits(debouncedCep)
        if (cepDigits.length === 8 && !cepLoading && cepDigits !== lastFetchedCepRef.current) {
            fetchCEP(cepDigits)
        }
    }, [debouncedCep, cepLoading, fetchCEP])


    async function handleSubmit(){
        setSubmitting(true); setErr({})
        try {
            const payload = {
                ...f,
                cpf:   onlyDigits(f.cpf),
                cep:   onlyDigits(f.cep),
                phone: onlyDigits(f.phone),
            }
            const saved = isEdit
                ? await api.put<Contact>(`/contacts/${contact!.id}`, payload)
                : await api.post<Contact>('/contacts', payload)

            onSaved(saved)
            if (isEdit) resetAll()
            onClose()

        } catch (e: unknown) {
            const error = e as { detail?: { errors?: Record<string, string[]> } }
            const detail = error?.detail
            const bag = detail?.errors || {}
            const flat: Record<string,string> = {}
            Object.keys(bag).forEach(k => flat[k] = String(bag[k][0]))
            setErr(Object.keys(flat).length ? flat : { name: 'Erro ao salvar. Tente novamente.' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={() => { if(!isEdit) resetAll(); onClose() }} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit? 'Editar Contato': 'Novo Contato'}</DialogTitle>

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