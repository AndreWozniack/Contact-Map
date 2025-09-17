import { TextField, Button, InputAdornment, Stack } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

type Props = {
    searchValue: string
    onSearchChange: (value: string) => void
    onNewContact: () => void
    onPageChange: (page: number) => void
}

export default function ContactsSearchBar({ searchValue, onSearchChange, onNewContact, onPageChange }: Props) {
    return (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField
                value={searchValue}
                onChange={(e) => {
                    onPageChange(1)
                    onSearchChange(e.target.value)
                }}
                placeholder="Buscar por nome ou CPF"
                size="small"
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
                onClick={onNewContact}
            >
                Novo
            </Button>
        </Stack>
    )
}
