import { createContext } from 'react';

/**
 * Tipo representando um usuário autenticado
 */
export type User = { 
    id: number; 
    name: string; 
    email: string 
};

/**
 * Tipo do contexto de autenticação
 * 
 * Define a estrutura e funcionalidades disponíveis no contexto de auth,
 * incluindo dados do usuário, token e operações de autenticação.
 */
export type AuthContextType = {
    user: User | null;
    token: string | null;
    ready: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteCount: (params: { id: string }) => Promise<void>;
};

/**
 * Contexto React para gerenciamento de autenticação
 * 
 * Fornece acesso global ao estado de autenticação da aplicação
 * através do padrão Context + Provider do React.
 */
export const AuthContext = createContext<AuthContextType | null>(null);
