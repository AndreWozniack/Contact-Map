import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: { main: '#6750A4' },
        secondary: { main: '#7D5260' },
        mode: 'light',
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } } },
        MuiTextField: { defaultProps: { fullWidth: true, variant: 'outlined' } },
    },
});
