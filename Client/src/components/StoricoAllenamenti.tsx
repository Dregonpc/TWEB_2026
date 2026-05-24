import { useState } from 'react';
import {
    getEserciziLog,
    getCommentiLog,
    eliminaLog,
} from '../api/allenamentoApi';
import type { LogAllenamento, EsercizioSvolto, CommentoAllenamento } from '../types';
import CommentoAllenamentoComponent from './CommentoAllenamentoComponent';
import {
    Dumbbell,
    ClipboardList,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Trash2,
    AlertTriangle,
} from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    /** Lista log passata dal genitore LogAllenamentoPage. */
    logs: LogAllenamento[];
    /**
     * Chiamata dopo che il DELETE ha avuto successo,
     * così il genitore può rimuovere il log dallo stato condiviso.
     */
    onEliminaLog: (id: number) => void;
}

/**
 * Mostra lo storico degli allenamenti dell'utente.
 * Gestisce internamente il caricamento on-demand di esercizi e commenti,
 * e il flusso di conferma eliminazione.
 * Riceve `logs` come prop dal genitore (LogAllenamentoPage), che la aggiorna
 * anche quando il fratello NuovoAllenamentoForm aggiunge un nuovo record.
 */
export default function StoricoAllenamenti({ logs, onEliminaLog }: Props) {

    // Esercizi svolti caricati on-demand per ogni log
    const [eserciziMap, setEserciziMap]               = useState<Record<number, EsercizioSvolto[]>>({});
    const [loadingEserciziMap, setLoadingEserciziMap] = useState<Record<number, boolean>>({});
    const [eserciziAperti, setEserciziAperti]         = useState<number | null>(null);

    // Commenti del coach caricati on-demand
    const [commentiMap, setCommentiMap]               = useState<Record<number, CommentoAllenamento[]>>({});
    const [loadingCommentiMap, setLoadingCommentiMap] = useState<Record<number, boolean>>({});
    const [commentiAperti, setCommentiAperti]         = useState<number | null>(null);

    // Eliminazione con conferma inline
    const [confermaEliminaId, setConfermaEliminaId]   = useState<number | null>(null);
    const [eliminandoId, setEliminandoId]             = useState<number | null>(null);
    const [erroreElimina, setErroreElimina]           = useState<string | null>(null);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const toggleEsercizi = async (logId: number) => {
        if (eserciziAperti === logId) { setEserciziAperti(null); return; }
        setEserciziAperti(logId);
        if (!eserciziMap[logId]) {
            setLoadingEserciziMap(prev => ({ ...prev, [logId]: true }));
            try {
                const data = await getEserciziLog(logId);
                setEserciziMap(prev => ({ ...prev, [logId]: data }));
            } catch (err) {
                console.error('Errore caricamento esercizi:', err);
            } finally {
                setLoadingEserciziMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

    const toggleCommenti = async (logId: number) => {
        if (commentiAperti === logId) { setCommentiAperti(null); return; }
        setCommentiAperti(logId);
        if (!commentiMap[logId]) {
            setLoadingCommentiMap(prev => ({ ...prev, [logId]: true }));
            try {
                const data = await getCommentiLog(logId);
                setCommentiMap(prev => ({ ...prev, [logId]: data }));
            } catch (err) {
                console.error('Errore caricamento commenti:', err);
            } finally {
                setLoadingCommentiMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

    const handleConfermaElimina = async (logId: number) => {
        setErroreElimina(null);
        setEliminandoId(logId);
        try {
            await eliminaLog(logId);
            // Pulizia mappe interne
            setEserciziMap(prev => { const m = { ...prev }; delete m[logId]; return m; });
            setCommentiMap(prev => { const m = { ...prev }; delete m[logId]; return m; });
            setConfermaEliminaId(null);
            // Notifica il genitore → aggiorna storico condiviso
            onEliminaLog(logId);
        } catch {
            setErroreElimina("Errore durante l'eliminazione. Riprova.");
        } finally {
            setEliminandoId(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Nessun allenamento registrato.</p>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {logs.map(log => (
                <li
                    key={log.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                >
                    <div className="px-5 py-4 flex flex-col gap-3">

                        {/* Riga data + cestino */}
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-bold text-slate-700">
                                {new Date(log.data).toLocaleDateString('it-IT', {
                                    weekday: 'long', day: 'numeric', month: 'long',
                                })}
                            </span>

                            {confermaEliminaId === log.id ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Sicuro?
                                    </span>
                                    <button
                                        onClick={() => handleConfermaElimina(log.id)}
                                        disabled={eliminandoId === log.id}
                                        className="text-xs font-semibold text-white bg-red-500
                                                   hover:bg-red-600 disabled:opacity-50
                                                   px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        {eliminandoId === log.id ? 'Eliminazione...' : 'Elimina'}
                                    </button>
                                    <button
                                        onClick={() => { setConfermaEliminaId(null); setErroreElimina(null); }}
                                        className="text-xs text-slate-400 hover:text-slate-600
                                                   transition-colors cursor-pointer"
                                    >
                                        Annulla
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setConfermaEliminaId(log.id); setErroreElimina(null); }}
                                    className="text-slate-300 hover:text-red-400 transition-colors
                                               cursor-pointer shrink-0"
                                    title="Elimina allenamento"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {erroreElimina && confermaEliminaId === log.id && (
                            <p className="text-xs text-red-500">{erroreElimina}</p>
                        )}

                        <span className="text-sm text-slate-500">
                            {log.note || 'Nessuna nota'}
                        </span>

                        {/* Azioni espandi */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => toggleEsercizi(log.id)}
                                className="flex items-center gap-1.5 text-xs text-emerald-600
                                           hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                Esercizi svolti
                                {eserciziAperti === log.id
                                    ? <ChevronUp className="w-3 h-3" />
                                    : <ChevronDown className="w-3 h-3" />
                                }
                            </button>

                            <button
                                onClick={() => toggleCommenti(log.id)}
                                className="flex items-center gap-1.5 text-xs text-green-600
                                           hover:text-green-800 transition-colors cursor-pointer"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Commenti del coach
                                {commentiAperti === log.id
                                    ? <ChevronUp className="w-3 h-3" />
                                    : <ChevronDown className="w-3 h-3" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Esercizi espansi */}
                    {eserciziAperti === log.id && (
                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 flex flex-col gap-3">
                            {loadingEserciziMap[log.id] ? (
                                <p className="text-xs text-slate-400">Caricamento esercizi...</p>
                            ) : (eserciziMap[log.id] ?? []).length === 0 ? (
                                <p className="text-xs text-slate-400">Nessun esercizio trovato.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {(eserciziMap[log.id] ?? []).map(esercizio => (
                                        <div
                                            key={esercizio.id}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {esercizio.nomeEsercizio}
                                                </span>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                    {esercizio.serie       != null && <span>Serie: {esercizio.serie}</span>}
                                                    {esercizio.ripetizioni != null && <span>Ripetizioni: {esercizio.ripetizioni}</span>}
                                                    {esercizio.peso        != null && <span>Peso: {esercizio.peso} kg</span>}
                                                    {esercizio.durata      != null && <span>Durata: {esercizio.durata} sec</span>}
                                                </div>
                                                {esercizio.commento && (
                                                    <p className="text-xs text-slate-400 italic">
                                                        {esercizio.commento}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Commenti espansi */}
                    {commentiAperti === log.id && (
                        <CommentoAllenamentoComponent
                            commenti={commentiMap[log.id] ?? []}
                            loading={loadingCommentiMap[log.id] ?? false}
                            // nessun onElimina: l'utente può solo leggere i commenti
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}
