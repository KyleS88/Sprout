import { create } from 'zustand';
import type { AuthState } from '../types/types';

const authStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    setIsAuthenticated: (isAuth: boolean) => {
        set({isAuthenticated: isAuth})
    },
    token: localStorage.getItem("token") ?? "",
    setToken: (token: string) => {
        set({token})
    },

}))
export default authStore