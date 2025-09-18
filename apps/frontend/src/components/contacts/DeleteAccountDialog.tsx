import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Diálogo de confirmação para exclusão de conta
 * Requer senha do usuário para confirmar a ação
 */
export default function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const { logout } = useAuth();
  const [pwd, setPwd] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  const handleClose = () => {
    if (!deleting) {
      setPwd('');
      setDelErr(null);
      onClose();
    }
  };

  const handleConfirmDelete = async () => {
    setDelErr(null);
    setDeleting(true);
    try {
      await api.del('/account', { password: pwd });
      await logout();
    } catch (error: unknown) {
      const err = error as { detail?: { message?: string } };
      setDelErr(err?.detail?.message || 'Senha inválida ou erro ao excluir a conta.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Excluir conta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography sx={{ mb: 2 }}>
          Essa ação é irreversível. Para confirmar, digite sua senha.
        </Typography>

        {delErr && <Alert severity="error" sx={{ mb: 2 }}>{delErr}</Alert>}

        <TextField
          label="Senha"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          fullWidth
          autoFocus
          disabled={deleting}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={deleting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirmDelete}
          disabled={!pwd || deleting}
        >
          {deleting ? "Excluindo..." : "Excluir conta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
