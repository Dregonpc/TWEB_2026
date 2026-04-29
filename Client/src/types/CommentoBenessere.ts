import type { Utente } from './Utente';
import type { LogBenessere } from './LogBenessere';

export interface CommentoBenessere {
    id: number;
    testo: string;
    data: string; // formato ISO "YYYY-MM-DD"
    psicologo: Utente;
    logBenessere: LogBenessere;
}