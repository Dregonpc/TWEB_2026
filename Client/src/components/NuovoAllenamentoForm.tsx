import { useState } from 'react';
import { salvaLog, aggiungiEsercizioSvolto } from '../api/allenamentoApi';
import type { LogAllenamento, EsercizioSvolto } from '../types';
import { Trophy, X, Plus, Trash2 } from 'lucide-react';

// Esercizio Svolto locale
interface EsercizioForm {
    id: number;
    nomeEsercizio: string;
    serie: string;
    ripetizioni: string;
    peso: string;
    durata: string;
    commento: string;
}

const esercizioVuoto = (id: number): EsercizioForm => ({
    id,
    nomeEsercizio: '',
    serie: '',
    ripetizioni: '',
    peso: '',
    durata: '',
    commento: '',
});

// Sotto-componente: card singolo esercizio nel form
interface ExerciseCardProps {
    esercizio: EsercizioForm;
    index: number;
    onChange: (id: number, field: keyof EsercizioForm, value: string) => void;
    onRemove: (id: number) => void;
}

function ExerciseCard({ esercizio, index, onChange, onRemove }: ExerciseCardProps) {
    return (
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                    Esercizio {index + 1}
                </span>
                <button
                    type="button"
                    onClick={() => onRemove(esercizio.id)}
                    className="flex items-center gap-1 text-xs text-red-400
                               hover:text-red-600 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Rimuovi
                </button>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">
                    Nome esercizio <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={esercizio.nomeEsercizio}
                    onChange={e => onChange(esercizio.id, 'nomeEsercizio', e.target.value)}
                    placeholder="Es. Squat, Panca piana..."
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { field: 'serie',      label: 'Serie',       placeholder: 'es. 4'  },
                    { field: 'ripetizioni', label: 'Ripetizioni', placeholder: 'es. 10' },
                    { field: 'peso',       label: 'Peso (kg)',   placeholder: 'es. 80' },
                    { field: 'durata',     label: 'Durata (sec)',placeholder: 'es. 60' },
                ].map(({ field, label, placeholder }) => (
                    <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">{label}</label>
                        <input
                            type="number"
                            value={esercizio[field as keyof EsercizioForm]}
                            onChange={e => onChange(esercizio.id, field as keyof EsercizioForm, e.target.value)}
                            placeholder={placeholder}
                            min={0}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Note</label>
                <input
                    type="text"
                    value={esercizio.commento}
                    onChange={e => onChange(esercizio.id, 'commento', e.target.value)}
                    placeholder="Note specifiche..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>
        </div>
    );
}

// Componente principale

interface Props {
    /** Chiamata dal genitore quando un nuovo log viene salvato con successo. */
    onNuovoLog: (log: LogAllenamento) => void;
}

/**
 * Form modale per registrare una nuova sessione di allenamento.
 * Gestisce internamente il proprio stato di apertura.
 * Notifica il genitore tramite `onNuovoLog` così che il fratello
 * StoricoAllenamenti possa aggiornarsi senza ricaricare tutto.
 */
export default function NuovoAllenamentoForm({ onNuovoLog }: Props) {
    const [mostraModal, setMostraModal] = useState(false);

    const [data, setData] = useState('');
    const [note, setNote] = useState('');
    const [esercizi, setEsercizi] = useState<EsercizioForm[]>([esercizioVuoto(1)]);
    const [nextId, setNextId] = useState(2);
    const [salvataggio, setSalvataggio] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);

    const resetForm = () => {
        setData('');
        setNote('');
        setEsercizi([esercizioVuoto(1)]);
        setNextId(2);
        setErrore(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvataggio(true);
        setErrore(null);

        try {
            const eserciziValidi = esercizi.filter(ex => ex.nomeEsercizio.trim() !== '');
            if (!data)                    throw new Error('Inserisci la data');
            if (eserciziValidi.length === 0) throw new Error('Inserisci almeno un esercizio');

            // 1. Salva il log
            const nuovoLog = await salvaLog({ data, note: note.trim() || null });

            // 2. Salva gli esercizi svolti in parallelo
            await Promise.all(
                eserciziValidi.map(ex =>
                    aggiungiEsercizioSvolto({
                        nomeEsercizio: ex.nomeEsercizio.trim(),
                        serie:         ex.serie       ? parseInt(ex.serie, 10)       : null,
                        ripetizioni:   ex.ripetizioni ? parseInt(ex.ripetizioni, 10) : null,
                        peso:          ex.peso        ? parseInt(ex.peso, 10)        : null,
                        durata:        ex.durata      ? parseInt(ex.durata, 10)      : null,
                        commento:      ex.commento    || null,
                        logAllenamento: { id: nuovoLog.id } as LogAllenamento,
                    } as Partial<EsercizioSvolto>)
                )
            );

            // 3. Notifica il genitore → StoricoAllenamenti si aggiornerà
            onNuovoLog(nuovoLog);
            setMostraModal(false);
            resetForm();
        } catch (err) {
            setErrore(err instanceof Error ? err.message : 'Errore nel salvataggio.');
        } finally {
            setSalvataggio(false);
        }
    };

    return (
        <>
            {/* Pulsante di apertura */}
            <button
                onClick={() => setMostraModal(true)}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg
                           font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
                <Plus size={18} />
                Nuovo allenamento
            </button>

            {/* Modal */}
            {mostraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center
                                bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl
                                    max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">

                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="text-emerald-600" />
                                    Registra sessione
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => { setMostraModal(false); resetForm(); }}
                                    className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    value={data}
                                    onChange={e => setData(e.target.value)}
                                    required
                                    className="border p-2 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Note generali..."
                                    className="border p-2 rounded-lg text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Esercizi</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEsercizi(prev => [...prev, esercizioVuoto(nextId)]);
                                            setNextId(prev => prev + 1);
                                        }}
                                        className="text-emerald-700 text-sm font-bold cursor-pointer"
                                    >
                                        + Aggiungi
                                    </button>
                                </div>

                                {esercizi.map((ex, i) => (
                                    <ExerciseCard
                                        key={ex.id}
                                        esercizio={ex}
                                        index={i}
                                        onRemove={id =>
                                            setEsercizi(prev =>
                                                prev.length > 1 ? prev.filter(e => e.id !== id) : prev
                                            )
                                        }
                                        onChange={(id, field, value) =>
                                            setEsercizi(prev =>
                                                prev.map(e => e.id === id ? { ...e, [field]: value } : e)
                                            )
                                        }
                                    />
                                ))}
                            </div>

                            {errore && (
                                <p className="text-sm text-red-600">{errore}</p>
                            )}

                            <button
                                type="submit"
                                disabled={salvataggio}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl
                                           font-bold shadow-lg disabled:opacity-50 cursor-pointer
                                           transition-colors"
                            >
                                {salvataggio ? 'Salvataggio...' : 'Salva allenamento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
