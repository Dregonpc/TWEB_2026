import type { LogAllenamento } from '../types/LogAllenamento';
import type { EsercizioSvolto } from '../types/EsercizioSvolto';
import type { SchedaAllenamento } from '../types/SchedaAllenamento';
import type { CommentoAllenamento } from '../types/CommentoAllenamento';

const BASE_URL = 'http://localhost:8080/api';

// LOG ALLENAMENTO

/** Recupera tutti i log allenamento dell'utente loggato */
export async function getLogAllenamento(): Promise<LogAllenamento[]> {
    const res = await fetch(`${BASE_URL}/allenamento/storico`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero log allenamento');
    return await res.json() as LogAllenamento[];
}

/** Crea un nuovo log allenamento */
export async function postLogAllenamento(
    data: { data: string; note?: string; esercizi: EsercizioSvoltoInput[] }
): Promise<LogAllenamento> {
    const res = await fetch(`${BASE_URL}/allenamento/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Errore nella creazione del log');
    return await res.json() as LogAllenamento;
}

/** Elimina un log allenamento */
export async function deleteLogAllenamento(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/allenamento/log/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Errore nell\'eliminazione del log');
}

// ESERCIZI SVOLTI

export interface EsercizioSvoltoInput {
    nomeEsercizio: string;
    serie?: number;
    ripetizioni?: number;
    peso?: number;      // kg
    durata?: number;    // secondi
    note?: string;
}

/** Recupera gli esercizi svolti di un log specifico */
export async function getEserciziLog(logId: number): Promise<EsercizioSvolto[]> {
    const res = await fetch(`${BASE_URL}/allenamento/log/${logId}/esercizi`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Errore nel recupero esercizi');
    return await res.json() as EsercizioSvolto[];
}

// SCHEDE ALLENAMENTO

/** Recupera le schede assegnate dal coach all'utente loggato */
export async function getSchedeUtente(): Promise<SchedaAllenamento[]> {
    const res = await fetch(`${BASE_URL}/allenamento/schede`, { credentials: 'include' });
    if (!res.ok) throw new Error('Errore nel recupero schede');
    return await res.json() as SchedaAllenamento[];
}

// COMMENTI

/** Recupera i commenti del coach su un log allenamento */
export async function getCommentiLog(logId: number): Promise<CommentoAllenamento[]> {
    const res = await fetch(`${BASE_URL}/allenamento/log/${logId}/commenti`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Errore nel recupero commenti');
    return await res.json() as CommentoAllenamento[];
}
