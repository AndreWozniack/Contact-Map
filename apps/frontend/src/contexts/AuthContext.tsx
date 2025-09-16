import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

type User = { id: number; name: string; email: string };

type AuthContextType = {
    user: User | null;
    token: string | null;
    ready: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            if (!token) { setReady(true); return; }
            try {
                const me = await api.get<User>('/me'); // precisa bearer (grupo auth:sanctum)
                setUser(me);
            } catch {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setReady(true);
            }
        })();
    }, [token]);

    async function login(email: string, password: string) {
        const resp = await api.post<{ token: string; user: User }>('/login', { email, password }, false);
        localStorage.setItem('token', resp.token);
        setToken(resp.token);
        setUser(resp.user);
    }

    async function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }

    const value = useMemo(() => ({ user, token, ready, login, logout }), [user, token, ready]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
