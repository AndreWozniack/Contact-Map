import { useContext } from 'react';
import { AuthContext } from '../contexts/auth-context';

/**
 * Hook para acessar contexto de autenticação
 * 
 * Fornece acesso aos dados do usuário logado e funções de autenticação
 * (login, logout, registro). Deve ser usado dentro de um AuthProvider.
 * 
 * @returns Contexto de autenticação com user, token e funções auth
 * @throws Erro se usado fora do AuthProvider
 */
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
};
