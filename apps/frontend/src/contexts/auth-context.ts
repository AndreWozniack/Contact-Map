import { createContext } from 'react';

export type User = { id: number; name: string; email: string };

export type AuthContextType = {
    user: User | null;
    token: string | null;
    ready: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
