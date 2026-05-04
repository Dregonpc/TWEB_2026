import type { Utente } from '../types/Utente.ts';

const BASE_URL = 'http://localhost:8080';

// Effettua il login e restituisce l'utente loggato
export async function login(username: string, password: string): Promise<Utente> {
    const res = await fetch(`${BASE_URL}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // fondamentale per mandare/ricevere il cookie di sessione
        body: JSON.stringify({ username, password }),
    });

    if (res.status === 401) {
        throw new Error('Credenziali non valide');
    }
    if (!res.ok) {
        throw new Error('Errore durante il login');
    }

    const data = await res.json();
    return data as Utente;
}

// Effettua il logout
export async function logout(): Promise<void> {
    await fetch(`${BASE_URL}/session`, {
        method: 'DELETE',
        credentials: 'include',
    });
}

// Recupera l'utente attualmente loggato (utile al refresh della pagina)
export async function getMe(): Promise<Utente | null> {
    const res = await fetch(`${BASE_URL}/session`, {
        credentials: 'include',
    });

    if (res.status === 401) {
        return null; // non loggato
    }
    if (!res.ok) {
        throw new Error('Errore nel recupero utente');
    }

    const data = await res.json();
    return data as Utente;
}