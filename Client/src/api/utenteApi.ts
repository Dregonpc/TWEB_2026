import { apiFetch } from './baseApi';
import type { Utente } from '../types';

// GET /api/utenti/listaUtenti — solo COACH e PSICOLOGO
export const getListaUtenti = () =>
    apiFetch<Utente[]>('/api/utenti/listaUtenti');

// GET /api/utenti/profilo/{username}
export const getProfiloUtente = (username: string) =>
    apiFetch<Utente>(`/api/utenti/profilo/${username}`);