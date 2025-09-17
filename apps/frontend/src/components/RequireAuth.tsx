import { type ReactNode } from 'react'
import { LinearProgress } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from "../hooks/useAuth";

/**
 * Props do componente RequireAuth
 */
type Props = { 
    /** Componentes filhos que serão renderizados apenas se o usuário estiver autenticado */
    children: ReactNode 
}

/**
 * Componente de proteção de rotas
 * 
 * Verifica se o usuário está autenticado antes de renderizar os componentes filhos.
 * Exibe um loading enquanto verifica a autenticação e redireciona para login
 * se o usuário não estiver autenticado.
 * 
 * @param children Componentes que só devem ser exibidos para usuários autenticados
 * @returns Componente protegido ou redirecionamento para login
 */
export default function RequireAuth({ children }: Props) {
    const { user, ready } = useAuth()
    const location = useLocation()

    if (!ready) return <LinearProgress />
    
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />

    return <>{children}</>
}