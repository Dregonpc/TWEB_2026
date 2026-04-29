import type { Utente } from './Utente';
import type { LogAllenamento } from './LogAllenamento';

export interface CommentoAllenamento {
    id: number;
    testo: string;
    data: string; // formato ISO "YYYY-MM-DD"
    coach: Utente;
    logAllenamento: LogAllenamento;
}