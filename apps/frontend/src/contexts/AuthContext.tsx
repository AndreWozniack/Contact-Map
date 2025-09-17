import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { AuthContext, type User } from './auth-context';

/**
 * Provedor de contexto de autenticação
 * 
 * Gerencia o estado global de autenticação da aplicação, incluindo
 * informações do usuário logado, token de acesso e operações de login/logout.
 * Também verifica automaticamente a validade do token armazenado no localStorage.
 * 
 * @param children Componentes filhos que terão acesso ao contexto
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            if (!token) { setReady(true); return; }
            try {
                const me = await api.get<User>('/me');
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

    /**
     * Realiza login do usuário
     * 
     * @param email Email do usuário
     * @param password Senha do usuário
     */
    async function login(email: string, password: string) {
        const resp = await api.post<{ token: string; user: User }>('/login', { email, password }, false);
        localStorage.setItem('token', resp.token);
        setToken(resp.token);
        setUser(resp.user);
    }

    /**
     * Realiza logout do usuário
     * 
     * Remove o token do localStorage e limpa o estado da aplicação
     */
    async function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }

    /**
     * Remove um contato específico
     * 
     * @param params Objeto contendo o ID do contato a ser removido
     */
    async function deleteCount(params: { id: string }) {
        await api.del(`/contacts/${params.id}`);
    }

    const value = useMemo(() => ({ user, token, ready, login, logout, deleteCount }), [user, token, ready]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
