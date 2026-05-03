import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Utente } from '../types/Utente';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/authApi';

// Forma del context
interface AuthContextType {
    utente: Utente | null;
    loading: boolean;         // true mentre controlla la sessione al primo caricamento
    errore: string | null;    // messaggio di errore login
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Creazione context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [utente, setUtente] = useState<Utente | null>(null);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);

    // Al primo caricamento dell'app controlla se c'è già una sessione attiva
    useEffect(() => {
        getMe()
            .then((u) => setUtente(u))
            .catch(() => setUtente(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (username: string, password: string) => {
        setErrore(null);
        try {
            const u = await apiLogin(username, password);
            setUtente(u);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
            setErrore(msg);
            throw err; // rilancia così la LoginPage può reagire se necessario
        }
    };

    const logout = async () => {
        await apiLogout();
        setUtente(null);
    };

    return (
        <AuthContext.Provider value={{ utente, loading, errore, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizzato
// Uso: const { utente, login, logout } = useAuth();
export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth deve essere usato dentro <AuthProvider>');
    }
    return ctx;
}