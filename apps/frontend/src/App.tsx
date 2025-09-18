import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import ContactsPage from './pages/Contacts'
import RequireAuth from './components/auth/RequireAuth'

/**
 * Componente principal da aplicação
 * 
 * Define as rotas da aplicação usando React Router,
 * incluindo proteção de rotas que requerem autenticação.
 */
export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/password-reset/:token" element={<ResetPasswordPage />} />
            <Route
                path="/contacts"
                element={
                    <RequireAuth>
                        <ContactsPage />
                    </RequireAuth>
                }
            />
            <Route path="/" element={<Navigate to="/contacts" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}