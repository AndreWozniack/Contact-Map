import { Menu, MenuItem } from '@mui/material';

interface SettingsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onDeleteAccount: () => void;
}

/**
 * Menu de configurações do usuário
 * Contém opções como excluir conta
 */
export default function SettingsMenu({ 
  anchorEl, 
  open, 
  onClose, 
  onDeleteAccount 
}: SettingsMenuProps) {
  const handleDeleteAccount = () => {
    onClose();
    onDeleteAccount();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem
        onClick={handleDeleteAccount}
        sx={{ color: "error.main", fontWeight: 600 }}
      >
        Excluir minha conta
      </MenuItem>
    </Menu>
  );
}
