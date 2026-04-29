import type { Utente } from './Utente';

export interface Dieta {
    id: number;
    titolo: string;
    dataCreazione: string | null; // formato ISO "YYYY-MM-DD"
    kcalTotali: number | null;
    descrizione: string | null;
    alternative: string | null;
    utente: Utente;  // destinatario
    coach: Utente;   // creatore
}