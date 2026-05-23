import { apiFetch } from './baseApi';
import type {
    LogAllenamento,
    SchedaAllenamento,
    EsercizioScheda,
    CommentoAllenamento,
    EsercizioSvolto,
} from '../types';

// USER

// GET /api/allenamento/storico
export const getStorico = () =>
    apiFetch<LogAllenamento[]>('/api/allenamento/storico');

// POST /api/allenamento/log
export const salvaLog = (log: Partial<LogAllenamento>) =>
    apiFetch<LogAllenamento>('/api/allenamento/log', {
        method: 'POST',
        body: JSON.stringify(log),
    });

// DELETE /api/allenamento/log/{logId}
export const eliminaLog = (logId: number) =>
    apiFetch<void>(`/api/allenamento/log/${logId}`, {
        method: 'DELETE',
    });

// POST /api/allenamento/nuovoEsercizioSvolto
export const aggiungiEsercizioSvolto = (esercizio: Partial<EsercizioSvolto>) =>
    apiFetch<EsercizioSvolto>('/api/allenamento/nuovoEsercizioSvolto', {
        method: 'POST',
        body: JSON.stringify(esercizio),
    });

// GET /api/allenamento/log/{logId}/esercizi
export const getEserciziLog = (logId: number) =>
    apiFetch<EsercizioSvolto[]>(`/api/allenamento/log/${logId}/esercizi`);

// GET /api/allenamento/schedeUtente
export const getSchedeUtente = () =>
    apiFetch<SchedaAllenamento[]>('/api/allenamento/schedeUtente');

// PUBBLICI

// GET /api/allenamento/eseriziScheda/{schedaId}
export const getEserciziScheda = (schedaId: number) =>
    apiFetch<EsercizioScheda[]>(`/api/allenamento/eseriziScheda/${schedaId}`);

// GET /api/allenamento/commenti/{logId}
export const getCommentiLog = (logId: number) =>
    apiFetch<CommentoAllenamento[]>(`/api/allenamento/commenti/${logId}`);

// COACH

// GET /api/allenamento/ultimi7?utenteId=X
export const getUltimi7 = (utenteId: number) =>
    apiFetch<LogAllenamento[]>(`/api/allenamento/ultimi7?utenteId=${utenteId}`);

// GET /api/allenamento/schedeCoach
export const getSchedeCoach = () =>
    apiFetch<SchedaAllenamento[]>('/api/allenamento/schedeCoach');

// POST /api/allenamento/nuovaScheda
export const creaScheda = (scheda: Partial<SchedaAllenamento>) =>
    apiFetch<SchedaAllenamento>('/api/allenamento/nuovaScheda', {
        method: 'POST',
        body: JSON.stringify(scheda),
    });

// GET /api/allenamento/storicoCoach?utenteId=X
export const getStoricoCoachUtente = (utenteId: number) =>
    apiFetch(`/api/allenamento/storicoCoach?utenteId=${utenteId}`);

// POST /api/allenamento/nuovoEsercizioScheda
export const aggiungiEsercizioScheda = (esercizio: Partial<EsercizioScheda>) =>
    apiFetch<EsercizioScheda>('/api/allenamento/nuovoEsercizioScheda', {
        method: 'POST',
        body: JSON.stringify(esercizio),
    });

// POST /api/allenamento/nuovoCommento
export const aggiungiCommento = (commento: Partial<CommentoAllenamento>) =>
    apiFetch<CommentoAllenamento>('/api/allenamento/nuovoCommento', {
        method: 'POST',
        body: JSON.stringify(commento),
    });