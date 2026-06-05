import { apiFetch } from './baseApi';
import type { LogAllenamento } from '../types/LogAllenamento';
import type { EsercizioSvolto } from '../types/EsercizioSvolto';
import type { SchedaAllenamento } from '../types/SchedaAllenamento';
import type { CommentoAllenamento } from '../types/CommentoAllenamento';

export interface EsercizioSvoltoInput {
    nomeEsercizio: string;
    serie?: number;
    ripetizioni?: number;
    peso?: number;      // kg
    durata?: number;    // secondi
    note?: string;
}

// USER

// GET /api/allenamento/storico
export const getLogAllenamento = () =>
    apiFetch<LogAllenamento[]>('/api/allenamento/storico');

// POST /api/allenamento/log
export const postLogAllenamento = (data: { data: string; note?: string; esercizi: EsercizioSvoltoInput[] }) =>
    apiFetch<LogAllenamento>('/api/allenamento/log', {
        method: 'POST',
        body: JSON.stringify(data),
    });

// DELETE /api/allenamento/log/{id}
export const deleteLogAllenamento = (id: number) =>
    apiFetch<void>(`/api/allenamento/log/${id}`, {
        method: 'DELETE',
    });

// GET /api/allenamento/log/{logId}/esercizi
export const getEserciziLog = (logId: number) =>
    apiFetch<EsercizioSvolto[]>(`/api/allenamento/log/${logId}/esercizi`);

// GET /api/allenamento/schede
export const getSchedeUtente = () =>
    apiFetch<SchedaAllenamento[]>('/api/allenamento/schede');

// COACH

// GET /api/allenamento/log/{logId}/commenti
export const getCommentiLog = (logId: number) =>
    apiFetch<CommentoAllenamento[]>(`/api/allenamento/log/${logId}/commenti`);