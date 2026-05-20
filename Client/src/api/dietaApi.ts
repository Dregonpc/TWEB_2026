import { apiFetch } from './baseApi';
import type { Dieta } from '../types';

// GET /api/dieta/utente — USER
export const getDieteUtente = () =>
    apiFetch<Dieta[]>('/api/dieta/utente');

// GET /api/dieta/coach — COACH
export const getDieteCoach = () =>
    apiFetch<Dieta[]>('/api/dieta/coach');


// POST /api/dieta/aggiungiDieta — solo COACH
export const creaDieta = (dieta: Partial<Dieta>) =>
    apiFetch<Dieta>('/api/dieta/aggiungiDieta', {
        method: 'POST',
        body: JSON.stringify(dieta),
    });