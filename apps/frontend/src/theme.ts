import { createTheme } from '@mui/material/styles';

/**
 * Configuração do tema Material Design 3 (MD3)
 * 
 * Implementa os princípios do Material Design 3 usando MUI v7.3.2:
 * - Tokens de cor dinâmicos e paletas tonais
 * - Estilização de componentes seguindo diretrizes MD3
 * - Componentes de navegação e entrada consistentes
 * - Sistema de formas com bordas arredondadas
 * - Escala tipográfica MD3
 */
export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { 
            main: '#6750A4',
            light: '#8B7ACC',
            dark: '#4F378B',
            contrastText: '#FFFFFF'
        },
        secondary: { 
            main: '#7D5260',
            light: '#A67C89',
            dark: '#633B48',
            contrastText: '#FFFFFF'
        },
        background: {
            default: '#FFFBFE',
            paper: '#FFFBFE'
        },
        error: {
            main: '#BA1A1A',
            light: '#DE3730',
            dark: '#93000A'
        }
    },
    shape: { 
        borderRadius: 12
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '2rem'
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem'
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.25rem'
        }
    },
    components: {
        MuiButton: { 
            styleOverrides: { 
                root: { 
                    textTransform: 'none',
                    borderRadius: 12,
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.12)'
                    }
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0px 4px 8px rgba(0,0,0,0.16)'
                    }
                }
            } 
        },
        MuiTextField: { 
            defaultProps: { 
                fullWidth: true, 
                variant: 'outlined'
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.12)'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.12)'
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFBFE',
                    color: '#1C1B1F',
                    boxShadow: 'none',
                    borderBottom: '1px solid #E7E0EC'
                }
            }
        }
    },
});
