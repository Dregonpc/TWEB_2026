import { apiFetch } from './baseApi';
import type { Utente } from '../types';

// POST /session — login
export const login = (username: string, password: string) =>
    apiFetch<Utente>('/session', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

// DELETE /session — logout
export const logout = () =>
    apiFetch<void>('/session', { method: 'DELETE' });

// GET /session — restituisce l'utente loggato (usato al caricamento dell'app)
export const getUtenteCorrente  = () =>
    apiFetch<Utente>('/session');