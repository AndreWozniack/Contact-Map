import { useEffect, useState } from 'react'
import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import { api } from '../lib/api'
import { useDebounce } from '../lib/useDebounce'

type Item = {
    street: string
    city: string
    state: string
    cep?: string
    district?: string
}

export default function AddressAutocomplete({
    uf, city, value, onChange, onPick, label = 'Rua', autoPickFirst = false
}: {
    uf: string
    city: string
    value: string
    onChange: (text: string) => void
    onPick?: (it: Item) => void
    label?: string
    autoPickFirst?: boolean
}) {
    const [input, setInput] = useState(value || '')
    const deb = useDebounce(input, 300)

    const [options, setOptions] = useState<Item[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => { setInput(value || '') }, [value])
    useEffect(() => {
        let cancelled = false
        if (!uf || !city || deb.trim().length < 3) { setOptions([]); return }

        ;(async () => {
            try {
                setLoading(true)
                const resp = await api.get<{ results: Item[] }>(
                    `/address/search?uf=${encodeURIComponent(uf)}&city=${encodeURIComponent(city)}&q=${encodeURIComponent(deb)}`
                )
                if (cancelled) return
                const list = resp.results || []
                setOptions(list)
                if (autoPickFirst && !value && list.length > 0) {
                    const first = list[0]
                    onChange(first.street)
                    onPick?.(first)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()

        return () => { cancelled = true }
    }, [uf, city, deb])

    return (
        <Autocomplete<Item, false, true, true>
            freeSolo
            options={options}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.street)}
            filterOptions={(x) => x}
            loading={loading}
            inputValue={input}
            onInputChange={(_, v) => { setInput(v); onChange(v) }}
            onChange={(_, opt) => {
                if (opt && typeof opt !== 'string') {
                    onChange(opt.street)
                    onPick?.(opt)
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    )
}