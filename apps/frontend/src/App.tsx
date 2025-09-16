import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import ContactsPage from './pages/Contacts';
import RequireAuth from './components/RequireAuth';

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
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
    );
}