import { useState } from 'react';
import { salvaLogBenessere } from '../api/benessereApi';
import type { LogBenessere } from '../types';
import { Plus, X } from 'lucide-react';

// ── Sotto-componente: slider con label e valore ───────────────────────────────

interface SliderProps {
    id: string;
    label: string;
    value: number;
    onChange: (v: number) => void;
    colore: string;
}

function SliderValore({ id, label, value, onChange, colore }: SliderProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <label htmlFor={id} className="text-sm font-semibold text-gray-600">
                    {label}
                </label>
                <span className={`text-sm font-bold ${colore}`}>{value}/10</span>
            </div>
            <input
                id={id}
                type="range"
                min={1}
                max={10}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-300">
                <span>1</span>
                <span>10</span>
            </div>
        </div>
    );
}

// ── Componente principale ─────────────────────────────────────────────────────

interface Props {
    /** Chiamata dal genitore quando il log viene salvato con successo. */
    onNuovoLog: (log: LogBenessere) => void;
}

/**
 * Form per registrare un nuovo log di benessere.
 * Gestisce internamente il proprio stato di apertura/chiusura.
 * Notifica il genitore tramite `onNuovoLog` così che il fratello
 * StoricoBenessere possa aggiornarsi immediatamente.
 */
export default function NuovoLogBenessereForm({ onNuovoLog }: Props) {
    const [mostraForm, setMostraForm] = useState(false);

    const [data, setData]                   = useState('');
    const [livelloUmore, setLivelloUmore]   = useState(5);
    const [livelloSonno, setLivelloSonno]   = useState(5);
    const [livelloStress, setLivelloStress] = useState(5);
    const [noteDiario, setNoteDiario]       = useState('');
    const [salvataggio, setSalvataggio]     = useState(false);
    const [errore, setErrore]               = useState<string | null>(null);

    const resetForm = () => {
        setData('');
        setLivelloUmore(5);
        setLivelloSonno(5);
        setLivelloStress(5);
        setNoteDiario('');
        setErrore(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrore(null);
        setSalvataggio(true);

        try {
            const nuovoLog = await salvaLogBenessere({
                data,
                livelloUmore,
                livelloSonno,
                livelloStress,
                noteDiario: noteDiario || null,
            });

            // Notifica il genitore → StoricoBenessere si aggiornerà
            onNuovoLog(nuovoLog);
            setMostraForm(false);
            resetForm();
        } catch {
            setErrore('Errore durante il salvataggio. Riprova.');
        } finally {
            setSalvataggio(false);
        }
    };

    return (
        <>
            {/* Pulsante di apertura */}
            <button
                onClick={() => setMostraForm(true)}
                className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700
                           text-white font-semibold px-4 py-2 rounded-lg
                           transition-colors cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                Nuovo log
            </button>

            {/* Modal */}
            {mostraForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center
                                bg-black/40 backdrop-blur-sm px-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md
                               max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Registra benessere
                        </h2>
                        <button
                            type="button"
                            onClick={() => { setMostraForm(false); resetForm(); }}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Data */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="data-benessere" className="text-sm font-semibold text-gray-600">
                            Data *
                        </label>
                        <input
                            id="data-benessere"
                            type="date"
                            value={data}
                            onChange={e => setData(e.target.value)}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                       focus:outline-none focus:border-purple-600
                                       focus:ring-1 focus:ring-purple-600 transition-colors"
                        />
                    </div>

                    <SliderValore
                        id="umore"
                        label="😊 Umore"
                        value={livelloUmore}
                        onChange={setLivelloUmore}
                        colore="text-yellow-500"
                    />
                    <SliderValore
                        id="sonno"
                        label="😴 Qualità del sonno"
                        value={livelloSonno}
                        onChange={setLivelloSonno}
                        colore="text-blue-500"
                    />
                    <SliderValore
                        id="stress"
                        label="😰 Livello di stress"
                        value={livelloStress}
                        onChange={setLivelloStress}
                        colore="text-red-500"
                    />

                    {/* Note diario */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="note-diario" className="text-sm font-semibold text-gray-600">
                            Note diario{' '}
                            <span className="text-gray-400 font-normal">(opzionale)</span>
                        </label>
                        <textarea
                            id="note-diario"
                            value={noteDiario}
                            onChange={e => setNoteDiario(e.target.value)}
                            placeholder="Come ti sei sentito oggi?"
                            rows={3}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                       resize-none focus:outline-none focus:border-purple-600
                                       focus:ring-1 focus:ring-purple-600 transition-colors"
                        />
                    </div>

                    {errore && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200
                                       rounded-lg px-4 py-2">
                            {errore}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={salvataggio}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50
                                   disabled:cursor-not-allowed text-white font-semibold
                                   rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
                    >
                        {salvataggio ? 'Salvataggio...' : 'Salva'}
                    </button>
                </form>
                </div>
            )}
        </>
    );
}