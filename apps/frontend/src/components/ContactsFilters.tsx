import { Select, MenuItem, ToggleButtonGroup, ToggleButton, Button, Stack } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

type Props = {
    sort: 'name' | 'cpf' | 'created_at'
    dir: 'asc' | 'desc'
    perPage: number
    onSortChange: (sort: 'name' | 'cpf' | 'created_at') => void
    onDirChange: (dir: 'asc' | 'desc') => void
    onPerPageChange: (perPage: number) => void
    onRefresh: () => void
    onReset: () => void
    onPageChange: (page: number) => void
}

export default function ContactsFilters({
    sort,
    dir,
    perPage,
    onSortChange,
    onDirChange,
    onPerPageChange,
    onRefresh,
    onReset,
    onPageChange
}: Props) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Select
                size="small"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as 'name' | 'cpf' | 'created_at')}
            >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="cpf">CPF</MenuItem>
                <MenuItem value="created_at">Criados</MenuItem>
            </Select>

            <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                value={dir}
                onChange={(_, v) => v && onDirChange(v)}
            >
                <ToggleButton value="asc">ASC</ToggleButton>
                <ToggleButton value="desc">DESC</ToggleButton>
            </ToggleButtonGroup>

            <Select
                size="small"
                value={perPage}
                onChange={(e) => {
                    onPerPageChange(Number(e.target.value))
                    onPageChange(1)
                }}
            >
                {[5, 10, 20, 50].map(n => (
                    <MenuItem key={n} value={n}>{n}/pág</MenuItem>
                ))}
            </Select>

            <Button size="small" startIcon={<RefreshIcon />} onClick={onRefresh}>
                Atualizar
            </Button>

            <Button size="small" onClick={onReset}>
                Limpar
            </Button>
        </Stack>
    )
}
