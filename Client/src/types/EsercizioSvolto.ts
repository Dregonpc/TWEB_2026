import type { LogAllenamento } from './LogAllenamento';

export interface EsercizioSvolto {
    id: number;
    nomeEsercizio: string;
    serie: number | null;
    ripetizioni: number | null;
    durata: number | null;
    peso: number | null;
    note: string | null;
    logAllenamento: LogAllenamento;
}