import { useState } from 'react';
import {
    getCommentiLogBenessere,
    eliminaLog,
} from '../api/benessereApi';
import type { LogBenessere, CommentoBenessere } from '../types';
import CommentoBenessereComponent from './CommentoBenessereComponent';
import {Heart, MessageCircle, ChevronDown, ChevronUp, Trash2, AlertTriangle} from 'lucide-react';

interface Props {
    /** Lista log passata dal genitore LogBenesserePage. */
    logs: LogBenessere[];
    /**
     * Chiamata dopo che il DELETE ha avuto successo,
     * così il genitore può rimuovere il log dallo stato condiviso.
     */
    onEliminaLog: (id: number) => void;
}

/**
 * Mostra lo storico dei log di benessere dell'utente.
 * Riceve `logs` dal genitore (LogBenesserePage).
 * Quando il fratello NuovoLogBenessereForm aggiunge un record,
 * il genitore aggiorna logs e questo componente si ri-renderizza.
 */
export default function StoricoBenessere({ logs, onEliminaLog }: Props) {

    // Commenti caricati on-demand
    const [commentiMap, setCommentiMap]               = useState<Record<number, CommentoBenessere[]>>({});
    const [loadingCommentiMap, setLoadingCommentiMap] = useState<Record<number, boolean>>({});
    const [commentiAperti, setCommentiAperti]         = useState<number | null>(null);

    // Eliminazione con conferma inline
    const [confermaEliminaId, setConfermaEliminaId]   = useState<number | null>(null);
    const [eliminandoId, setEliminandoId]             = useState<number | null>(null);
    const [erroreElimina, setErroreElimina]           = useState<string | null>(null);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const toggleCommenti = async (logId: number) => {
        if (commentiAperti === logId) { setCommentiAperti(null); return; }
        setCommentiAperti(logId);
        if (!commentiMap[logId]) {
            setLoadingCommentiMap(prev => ({ ...prev, [logId]: true }));
            try {
                const data = await getCommentiLogBenessere(logId);
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
            setCommentiMap(prev => { const m = { ...prev }; delete m[logId]; return m; });
            setConfermaEliminaId(null);
            // Notifica il genitore
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
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nessun log benessere registrato.</p>
                <p className="text-xs mt-1">Premi "Nuovo log" per iniziare!</p>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {logs.map(log => (
                <li
                    key={log.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="px-5 py-4 flex flex-col gap-2">

                        {/* Riga data + cestino */}
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-700">
                                {new Date(log.data).toLocaleDateString('it-IT', {
                                    weekday: 'long', day: 'numeric',
                                    month: 'long', year: 'numeric',
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
                                        className="text-xs text-gray-400 hover:text-gray-600
                                                   transition-colors cursor-pointer"
                                    >
                                        Annulla
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setConfermaEliminaId(log.id); setErroreElimina(null); }}
                                    className="text-gray-300 hover:text-red-400 transition-colors
                                               cursor-pointer shrink-0"
                                    title="Elimina log"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {erroreElimina && confermaEliminaId === log.id && (
                            <p className="text-xs text-red-500">{erroreElimina}</p>
                        )}

                        {/* Valori */}
                        <div className="flex gap-4 text-sm text-gray-600">
                            {log.livelloUmore  != null && <span>😊 Umore: {log.livelloUmore}/10</span>}
                            {log.livelloSonno  != null && <span>😴 Qualità del sonno: {log.livelloSonno}/10</span>}
                            {log.livelloStress != null && <span>😰 Livello di stress: {log.livelloStress}/10</span>}
                        </div>

                        {log.noteDiario && (
                            <p className="text-sm text-gray-500 italic">"{log.noteDiario}"</p>
                        )}

                        {/* Toggle commenti */}
                        <button
                            onClick={() => toggleCommenti(log.id)}
                            className="flex items-center gap-1.5 text-xs text-purple-500
                                       hover:text-purple-700 transition-colors mt-1 w-fit cursor-pointer"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Commenti psicologo
                            {commentiAperti === log.id
                                ? <ChevronUp className="w-3 h-3" />
                                : <ChevronDown className="w-3 h-3" />
                            }
                        </button>
                    </div>

                    {commentiAperti === log.id && (
                        <CommentoBenessereComponent
                            commenti={commentiMap[log.id] ?? []}
                            loading={loadingCommentiMap[log.id] ?? false}
                            // nessun onElimina: l'utente può solo leggere
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}
