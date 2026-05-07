import type { Utente } from './Utente';

export interface Dieta {
    id: number;
    titolo: string;
    dataCreazione: string | null; // formato ISO "YYYY-MM-DD"
    descrizione: string;
    utente: Utente;  // destinatario
    coach: Utente;   // creatore
}