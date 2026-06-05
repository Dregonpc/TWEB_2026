import { apiFetch } from './baseApi';
import type { LogBenessere, CommentoBenessere } from '../types';

// USER + PSICOLOGO

// GET /api/benessere/storico?utenteId=X
export const getStoricoBenessere = (utenteId: number) =>
    apiFetch<LogBenessere[]>(`/api/benessere/storico?utenteId=${utenteId}`);

// POST /api/benessere/log
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


// PSICOLOGO

// POST /api/benessere/commento
export const aggiungiCommentoBenessere = (commento: Partial<CommentoBenessere>) =>
    apiFetch<CommentoBenessere>('/api/benessere/commento', {
        method: 'POST',
        body: JSON.stringify(commento),
    });

// DELETE /api/benessere/eliminaCommento/{commentoId}
export const eliminaCommento = (commentoId: number) =>
    apiFetch<void>(`/api/benessere/eliminaCommento/${commentoId}`, {
        method: 'DELETE',
    });
