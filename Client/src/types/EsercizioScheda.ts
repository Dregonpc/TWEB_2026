import type { SchedaAllenamento } from "./SchedaAllenamento";

export interface EsercizioScheda {
    id: number;
    nomeEsercizio: string;
    serie: number | null;
    ripetizioni: number | null;
    note: string | null;
    schedaAllenamento: SchedaAllenamento;
}