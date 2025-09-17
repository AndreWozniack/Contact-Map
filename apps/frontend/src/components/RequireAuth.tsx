import { type ReactNode } from 'react'
import { LinearProgress } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from "../hooks/useAuth";

type Props = { children: ReactNode }

export default function RequireAuth({ children }: Props) {
    const { user, ready } = useAuth()
    const location = useLocation()

    if (!ready) return <LinearProgress />
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />

    return <>{children}</>
}