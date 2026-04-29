export type Ruolo = 'USER' | 'COACH' | 'PSICOLOGO';

export interface Utente {
    id: number;
    username: string;
    ruolo: Ruolo;
    nome: string;
    cognome: string;
    email: string;
    // Password NON inclusa nelle risposte dal backend
}