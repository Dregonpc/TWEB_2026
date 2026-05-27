import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import NuovoAllenamentoForm from '../components/NuovoAllenamentoForm';
import StoricoAllenamenti from '../components/StoricoAllenamenti';
import { getStorico } from '../api/allenamentoApi';
import type { LogAllenamento } from '../types';
import { Dumbbell } from 'lucide-react';

/**
 * Pagina di gestione degli allenamenti dell'utente.
 *
 * Gestisce lo stato condiviso `storico` e lo passa come prop
 * ai due componenti figli che fungono da fratelli:
 *
 *   NuovoAllenamentoForm  →  onNuovoLog(log)  →  LogAllenamentoPage
 *                                                        ↓ storico aggiornato
 *                                               StoricoAllenamenti (si ri-renderizza)
 *
 * Questo soddisfa il requisito di comunicazione fra componenti fratelli
 * tramite il genitore, e dimostra che una richiesta POST in un componente
 * modifica i dati visualizzati da un altro componente sulla stessa pagina.
 */
export default function LogAllenamentoPage() {
    const [storico, setStorico] = useState<LogAllenamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStorico()
            .then(setStorico)
            .catch(err => console.error('Errore caricamento storico:', err))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Ricevuta da NuovoAllenamentoForm dopo un POST riuscito.
     * Aggiunge il nuovo log in cima → StoricoAllenamenti si aggiorna.
     */
    const handleNuovoLog = (nuovoLog: LogAllenamento) => {
        setStorico(prev => [nuovoLog, ...prev]);
    };

    /**
     * Ricevuta da StoricoAllenamenti dopo un DELETE riuscito.
     * Rimuove il log dallo stato condiviso.
     */
    const handleEliminaLog = (id: number) => {
        setStorico(prev => prev.filter(l => l.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header + bottone apertura form (fratello A) */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Dumbbell className="text-green-700" />
                        I miei allenamenti
                    </h1>

                    {/* NuovoAllenamentoForm gestisce il proprio modal internamente */}
                    <NuovoAllenamentoForm onNuovoLog={handleNuovoLog} />
                </div>

                {/* Storico (fratello B) — riceve lo stesso storico aggiornato dal genitore */}
                {loading ? (
                    <p className="text-center text-slate-400">Caricamento...</p>
                ) : (
                    <StoricoAllenamenti
                        logs={storico}
                        onEliminaLog={handleEliminaLog}
                    />
                )}

            </main>
        </div>
    );
}