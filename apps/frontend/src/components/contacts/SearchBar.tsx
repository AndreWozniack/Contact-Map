import { TextField, Button, InputAdornment, Stack } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

/**
 * Propriedades do componente SearchBar
 */
type Props = {
    searchValue: string
    onSearchChange: (value: string) => void
    onNewContact: () => void
    onPageChange: (page: number) => void
}

/**
 * Barra de Pesquisa de Contatos
 * 
 * Componente que renderiza um campo de busca para filtrar contatos
 * por nome ou CPF, junto com um botão para criar novos contatos.
 * 
 * Características:
 * - Campo de busca com ícone e placeholder descritivo
 * - Botão de adicionar novo contato com ícone
 * - Reseta automaticamente para a primeira página ao pesquisar
 * - Layout responsivo com Stack horizontal
 * 
 * @param props - Propriedades do componente
 * @returns Componente da barra de pesquisa
 */
export default function SearchBar({ searchValue, onSearchChange, onNewContact, onPageChange }: Props) {
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
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
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
