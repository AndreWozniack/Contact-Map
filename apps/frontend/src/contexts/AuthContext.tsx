import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { AuthContext, type User } from './auth-context';

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

    async function deleteCount(params: { id: string }) {
        await api.del(`/contacts/${params.id}`);
    }

    const value = useMemo(() => ({ user, token, ready, login, logout, deleteCount }), [user, token, ready]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
