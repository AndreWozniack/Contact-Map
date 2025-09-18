import { ContactDialog } from '../ui';
import type { Contact } from '../../types';

interface ContactDialogsProps {
  editing: Contact | null;
  openNew: boolean;
  onCloseEdit: () => void;
  onCloseNew: () => void;
  onContactUpdated: (updated: Contact) => void;
  onContactCreated: (newContact: Contact) => void;
}

/**
 * Container para os diálogos de edição e criação de contatos
 */
export default function ContactDialogs({
  editing,
  openNew,
  onCloseEdit,
  onCloseNew,
  onContactUpdated,
  onContactCreated
}: ContactDialogsProps) {
  return (
    <>
      <ContactDialog
        open={!!editing}
        contact={editing}
        onClose={onCloseEdit}
        onSaved={onContactUpdated}
      />
      <ContactDialog
        open={openNew}
        contact={null}
        onClose={onCloseNew}
        onSaved={onContactCreated}
      />
    </>
  );
}
