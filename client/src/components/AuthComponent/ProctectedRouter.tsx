import React, { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
interface ProtectRouterProps {
    children: ReactNode,
    isAuthenticated: boolean,
}

const ProctectedRouter: React.FC<ProtectRouterProps> = ({ children, isAuthenticated }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" />
    };
    return children;
}

export default ProctectedRouter