import { apiFetch } from './baseApi';
import type { Dieta } from '../types';

// USER

// GET /api/dieta/utente
export const getDieteUtente = () =>
    apiFetch<Dieta[]>('/api/dieta/utente');

// COACH

// GET /api/dieta/coach
export const getDieteCoach = () =>
    apiFetch<Dieta[]>('/api/dieta/coach');

// POST /api/dieta/aggiungiDieta
export const creaDieta = (dieta: Partial<Dieta>) =>
    apiFetch<Dieta>('/api/dieta/aggiungiDieta', {
        method: 'POST',
        body: JSON.stringify(dieta),
    });

// DELETE /api/dieta/eliminaDieta/{dietaId}
export const eliminaDieta = (dietaId: number) =>
    apiFetch<void>(`/api/dieta/eliminaDieta/${dietaId}`, {
        method: 'DELETE',
    });