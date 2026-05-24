import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import NuovoLogBenessereForm from '../components/NuovoLogBenessereForm';
import StoricoBenessere from '../components/StoricoBenessere';
import { getStoricoBenessere } from '../api/benessereApi';
import { useAuth } from '../context/AuthContext';
import type { LogBenessere } from '../types';
import { Heart } from 'lucide-react';

/**
 * Pagina di gestione del benessere dell'utente.
 *
 * Gestisce lo stato condiviso `storico` e lo passa come prop
 * ai due componenti figli fratelli:
 *
 *   NuovoLogBenessereForm  →  onNuovoLog(log)  →  LogBenesserePage
 *                                                        ↓ storico aggiornato
 *                                               StoricoBenessere (si ri-renderizza)
 *
 * Stesso pattern di comunicazione fratelli di LogAllenamentoPage.
 */
export default function LogBenesserePage() {
    const { utente } = useAuth();
    const [storico, setStorico] = useState<LogBenessere[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!utente) return;
        getStoricoBenessere(utente.id)
            .then(setStorico)
            .catch(err => console.error('Errore caricamento storico benessere:', err))
            .finally(() => setLoading(false));
    }, [utente]);

    /**
     * Ricevuta da NuovoLogBenessereForm dopo un POST riuscito.
     * Aggiunge il nuovo log in cima → StoricoBenessere si aggiorna.
     */
    const handleNuovoLog = (nuovoLog: LogBenessere) => {
        setStorico(prev => [nuovoLog, ...prev]);
    };

    /**
     * Ricevuta da StoricoBenessere dopo un DELETE riuscito.
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
                    <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-purple-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Il mio benessere</h1>
                    </div>

                    {/* NuovoLogBenessereForm gestisce internamente il proprio pannello */}
                    <NuovoLogBenessereForm onNuovoLog={handleNuovoLog} />
                </div>

                {/* Storico (fratello B) */}
                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold text-gray-700">Storico</h2>

                    {loading ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : (
                        <StoricoBenessere
                            logs={storico}
                            onEliminaLog={handleEliminaLog}
                        />
                    )}
                </section>

            </main>
        </div>
    );
}