import { useState } from 'react';
import type { CommentoAllenamento } from '../types';
import { Trash2, AlertTriangle } from 'lucide-react';

interface Props {
    commenti: CommentoAllenamento[];
    loading?: boolean;
    onElimina?: (commentoId: number) => Promise<void>;
}

export default function CommentoAllenamentoComponent({
    commenti,
    loading = false,
    onElimina,
}: Props) {
    // Per ogni commento: stato conferma + errore
    const [confermaId, setConfermaId] = useState<number | null>(null);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);
    const [erroreId, setErroreId] = useState<number | null>(null);

    const handleConfermaElimina = async (commentoId: number) => {
        if (!onElimina) return;
        setErroreId(null);
        setEliminandoId(commentoId);
        try {
            await onElimina(commentoId);
            setConfermaId(null);
        } catch {
            setErroreId(commentoId);
        } finally {
            setEliminandoId(null);
        }
    };

    return (
        <div className="border-t border-slate-100 bg-green-50 px-5 py-4 flex flex-col gap-3">
            {loading ? (
                <p className="text-xs text-slate-400">Caricamento commenti...</p>
            ) : commenti.length === 0 ? (
                <p className="text-xs text-slate-400">Nessun commento ricevuto.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {commenti.map((commento) => (
                        <li key={commento.id} className="flex flex-col gap-0.5">

                            {/* Riga header: nome + data + cestino */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-green-700">
                                    {commento.coach.nome} {commento.coach.cognome}
                                    <span className="font-normal text-gray-400 ml-2">
                                        {new Date(commento.data).toLocaleDateString('it-IT')}
                                    </span>
                                </span>

                                {onElimina && (
                                    confermaId === commento.id ? (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Sicuro?
                                            </span>
                                            <button
                                                onClick={() => handleConfermaElimina(commento.id)}
                                                disabled={eliminandoId === commento.id}
                                                className="text-xs font-semibold text-white bg-red-500
                                                           hover:bg-red-600 disabled:opacity-50
                                                           px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                            >
                                                {eliminandoId === commento.id ? '...' : 'Elimina'}
                                            </button>
                                            <button
                                                onClick={() => { setConfermaId(null); setErroreId(null); }}
                                                className="text-xs text-gray-400 hover:text-gray-600
                                                           transition-colors cursor-pointer"
                                            >
                                                Annulla
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setConfermaId(commento.id); setErroreId(null); }}
                                            className="text-gray-300 hover:text-red-400 transition-colors
                                                       cursor-pointer shrink-0"
                                            title="Elimina commento"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )
                                )}
                            </div>

                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                {commento.testo}
                            </p>

                            {erroreId === commento.id && (
                                <p className="text-xs text-red-500">
                                    Errore durante l'eliminazione. Riprova.
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}