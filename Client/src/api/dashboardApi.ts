import type { LogAllenamento } from '../types/LogAllenamento';
import type { LogBenessere } from '../types/LogBenessere';
import type { SchedaAllenamento } from '../types/SchedaAllenamento';
import type { Dieta } from '../types/Dieta';
import type { Utente } from '../types/Utente';

const BASE_URL = 'http://localhost:8080/api';

// USER

export async function getLogAllenamento(): Promise<LogAllenamento[]> {
    const res = await fetch(`${BASE_URL}/allenamento/storico`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero log allenamento');
    return await res.json() as LogAllenamento[];
}

export async function getLogBenessere(): Promise<LogBenessere[]> {
    const res = await fetch(`${BASE_URL}/benessere/log`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero log benessere');
    return await res.json() as LogBenessere[];
}

export async function getSchedeUtente(): Promise<SchedaAllenamento[]> {
    const res = await fetch(`${BASE_URL}/allenamento/schede`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero schede');
    return await res.json() as SchedaAllenamento[];
}

export async function getDieteUtente(): Promise<Dieta[]> {
    const res = await fetch(`${BASE_URL}/dieta/mie`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero diete');
    return await res.json() as Dieta[];
}

// COACH / PSICOLOGO

export async function getUtentiSeguiti(): Promise<Utente[]> {
    const res = await fetch(`${BASE_URL}/utenti/miei`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero utenti');
    return await res.json() as Utente[];
}