import type { Utente } from './Utente';

export interface SchedaAllenamento {
    id: number;
    titolo: string;
    dataCreazione: string | null; // formato ISO "YYYY-MM-DD"
    note: string | null;
    utente: Utente;  // destinatario
    coach: Utente;   // creatore
}