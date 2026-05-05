import type { SchedaAllenamento } from "./SchedaAllenamento";

export interface EsercizioScheda {
    id: number;
    nomeEsercizio: string;
    serie: number | null;
    ripetizioni: number | null;
    durata: number | null;
    peso: number | null;
    note: string | null;
    Scheda: SchedaAllenamento;
}