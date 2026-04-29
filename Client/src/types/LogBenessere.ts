import type { Utente } from './Utente';

export interface LogBenessere {
    id: number;
    data: string; // formato ISO: "YYYY-MM-DD"
    livelloUmore: number | null;   // scala 1/10
    livelloSonno: number | null;   // scala 1/10
    livelloStress: number | null;  // scala 1/10
    noteDiario: string | null;
    utente: Utente;
}