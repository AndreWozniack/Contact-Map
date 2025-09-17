import { Box, Stack, Paper, Pagination } from '@mui/material'
import ContactCard from './ContactCard'
import type { Contact } from '../types'

type Props = {
    contacts: Contact[]
    selectedId: number | null
    loading: boolean
    page: number
    totalPages: number
    listRef: React.RefObject<HTMLDivElement>
    onContactSelect: (id: number) => void
    onContactCopy: (contact: Contact) => void
    onContactEdit: (contact: Contact) => void
    onContactDelete: (contact: Contact) => void
    onPageChange: (page: number) => void
}

export default function ContactsList({
    contacts,
    selectedId,
    loading,
    page,
    totalPages,
    listRef,
    onContactSelect,
    onContactCopy,
    onContactEdit,
    onContactDelete,
    onPageChange
}: Props) {
    if (contacts.length === 0 && !loading) {
        return (
            <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Nenhum contato encontrado.
            </Paper>
        )
    }

    return (
        <>
            <Stack spacing={1} ref={listRef}>
                {contacts.map((contact) => (
                    <Box key={contact.id} data-id={contact.id}>
                        <ContactCard
                            name={contact.name}
                            subtitle={[
                                contact.street,
                                contact.number,
                                contact.neighborhood,
                                contact.city,
                                contact.state
                            ].filter(Boolean).join(', ')}
                            selected={selectedId === contact.id}
                            onClick={() => onContactSelect(contact.id)}
                            contact={contact}
                            onCopy={onContactCopy}
                            onEdit={onContactEdit}
                            onDelete={onContactDelete}
                        />
                    </Box>
                ))}
            </Stack>

            <Stack direction="row" justifyContent="center" sx={{ py: 1.5 }}>
                <Pagination
                    page={page}
                    count={totalPages}
                    onChange={(_, p) => onPageChange(p)}
                    color="primary"
                />
            </Stack>
        </>
    )
}
