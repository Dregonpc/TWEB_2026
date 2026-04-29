import type { Utente } from './Utente';

export interface LogAllenamento {
    id: number;
    data: string; // formato ISO: "YYYY-MM-DD"
    note: string | null;
    utente: Utente;
}