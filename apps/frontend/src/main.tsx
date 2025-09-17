import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App.tsx';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';

/**
 * Ponto de entrada da aplicação React
 * 
 * Configura os provedores globais necessários:
 * - ThemeProvider: Aplica tema Material Design 3 customizado
 * - CssBaseline: Normaliza estilos CSS entre navegadores
 * - BrowserRouter: Habilita roteamento baseado em URL
 * - AuthProvider: Fornece contexto de autenticação para toda a app
 * 
 * Também importa fontes Roboto para consistência visual.
 */
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
);
