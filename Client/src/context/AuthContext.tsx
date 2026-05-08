import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Utente } from '../types/Utente';
import { login as apiLogin, logout as apiLogout, getUtenteCorrente } from '../api/authApi';

// struct di contesto
interface AuthContextType {
    utente: Utente | null;
    loading: boolean;
    errore: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearErrore: () => void;
}

// creazione contesto
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [utente, setUtente] = useState<Utente | null>(null);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);

    useEffect(() => {
        getUtenteCorrente()
            .then((u) => setUtente(u))
            .catch(() => setUtente(null))
            .finally(() => setLoading(false));
    }, []);

    // login
    const login = async (username: string, password: string) => {
        setErrore(null);
        try {
            const u = await apiLogin(username, password);
            setUtente(u);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
            setErrore(msg);
            throw err;
        }
    };

    // logout
    const logout = async () => {
        setUtente(null);                      // reset immediato nell'UI
        await apiLogout().catch(() => {});    // errori di rete sul logout ignorati
    };

    const clearErrore = () => setErrore(null);

    return (
        <AuthContext.Provider value={{ utente, loading, errore, login, logout, clearErrore }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizzato
export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
    return ctx;
}