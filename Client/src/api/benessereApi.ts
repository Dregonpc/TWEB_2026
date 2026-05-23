import { apiFetch } from './baseApi';
import type { LogBenessere, CommentoBenessere } from '../types';

// GET /api/benessere/storico?utenteId=X
export const getStoricoBenessere = (utenteId: number) =>
    apiFetch<LogBenessere[]>(`/api/benessere/storico?utenteId=${utenteId}`);

// POST /api/benessere/log — USER
export const salvaLogBenessere = (log: Partial<LogBenessere>) =>
    apiFetch<LogBenessere>('/api/benessere/log', {
        method: 'POST',
        body: JSON.stringify(log),
    });

// DELETE /api/benessere/log/{logId}
export const eliminaLog = (logId: number) =>
    apiFetch<void>(`/api/benessere/log/${logId}`, {
        method: 'DELETE',
    });


// GET /api/benessere/commenti/{logId}
export const getCommentiLogBenessere = (logId: number) =>
    apiFetch<CommentoBenessere[]>(`/api/benessere/commenti/${logId}`);

// POST /api/benessere/commento — solo PSICOLOGO
export const aggiungiCommentoBenessere = (commento: Partial<CommentoBenessere>) =>
    apiFetch<CommentoBenessere>('/api/benessere/commento', {
        method: 'POST',
        body: JSON.stringify(commento),
    });