import type { LogAllenamento } from './LogAllenamento';

export interface EsercizioSvolto {
    id: number;
    nomeEsercizio: string;
    serie: number | null;
    ripetizioni: number | null;
    commento: string | null;
    logAllenamento: LogAllenamento;
}