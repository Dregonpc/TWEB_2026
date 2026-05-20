import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import CommentoAllenamentoComponent from '../components/CommentoAllenamentoComponent';
import { getStorico, salvaLog, getCommentiLog } from '../api/allenamentoApi';
import type { LogAllenamento, CommentoAllenamento } from '../types';
import {
    Trophy,
    X,
    Plus,
    Trash2,
    Dumbbell,
    MessageCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

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

function ExerciseCard({
                          esercizio,
                          index,
                          onChange,
                          onRemove
                      }: {
    esercizio: EsercizioForm;
    index: number;
    onChange: (id: number, field: keyof EsercizioForm, value: string) => void;
    onRemove: (id: number) => void;
}) {
    return (
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                    Esercizio {index + 1}
                </span>
                <button
                    type="button"
                    onClick={() => onRemove(esercizio.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
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
                    onChange={(e) => onChange(esercizio.id, 'nomeEsercizio', e.target.value)}
                    placeholder="Es. Squat, Panca piana..."
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { field: 'serie', label: 'Serie', placeholder: 'es. 4' },
                    { field: 'ripetizioni', label: 'Ripetizioni', placeholder: 'es. 10' },
                    { field: 'peso', label: 'Peso (kg)', placeholder: 'es. 80' },
                    { field: 'durata', label: 'Durata (min)', placeholder: 'es. 5' },
                ].map(({ field, label, placeholder }) => (
                    <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">{label}</label>
                        <input
                            type="number"
                            value={esercizio[field as keyof EsercizioForm]}
                            onChange={(e) =>
                                onChange(esercizio.id, field as keyof EsercizioForm, e.target.value)
                            }
                            placeholder={placeholder}
                            min={0}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Note</label>
                <input
                    type="text"
                    value={esercizio.commento}
                    onChange={(e) => onChange(esercizio.id, 'commento', e.target.value)}
                    placeholder="Note specifiche..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>
        </div>
    );
}

export default function LogAllenamentoPage() {
    const [storico, setStorico] = useState<LogAllenamento[]>([]);
    const [loading, setLoading] = useState(true);

    const [mostraModal, setMostraModal] = useState(false);
    const [data, setData] = useState('');
    const [note, setNote] = useState('');
    const [esercizi, setEsercizi] = useState<EsercizioForm[]>([esercizioVuoto(1)]);
    const [nextId, setNextId] = useState(2);
    const [salvataggio, setSalvataggio] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);

    const [commentiMap, setCommentiMap] = useState<Record<number, CommentoAllenamento[]>>({});
    const [loadingCommentiMap, setLoadingCommentiMap] = useState<Record<number, boolean>>({});
    const [commentiAperti, setCommentiAperti] = useState<number | null>(null);

    useEffect(() => {
        caricaStorico();
    }, []);

    const caricaStorico = async () => {
        try {
            const logs = await getStorico();
            setStorico(logs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCommenti = async (logId: number) => {
        if (commentiAperti === logId) {
            setCommentiAperti(null);
            return;
        }

        setCommentiAperti(logId);

        if (!commentiMap[logId]) {
            setLoadingCommentiMap(prev => ({ ...prev, [logId]: true }));
            try {
                const commenti = await getCommentiLog(logId);
                setCommentiMap(prev => ({ ...prev, [logId]: commenti }));
            } catch (err) {
                console.error('Errore caricamento commenti:', err);
            } finally {
                setLoadingCommentiMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvataggio(true);

        try {
            const logDaSalvare = {
                data,
                note: note || null,
                eserciziSvolti: esercizi.map(ex => ({
                    nomeEsercizio: ex.nomeEsercizio,
                    serie: ex.serie ? parseInt(ex.serie) : null,
                    ripetizioni: ex.ripetizioni ? parseInt(ex.ripetizioni) : null,
                    peso: ex.peso ? parseFloat(ex.peso) : null,
                    durata: ex.durata ? parseInt(ex.durata) : null,
                    note: ex.commento || null
                }))
            };

            const nuovoLog = await salvaLog(logDaSalvare);
            setStorico(prev => [nuovoLog, ...prev]);
            setMostraModal(false);
            resetForm();
        } catch {
            setErrore('Errore nel salvataggio.');
        } finally {
            setSalvataggio(false);
        }
    };

    const resetForm = () => {
        setData('');
        setNote('');
        setEsercizi([esercizioVuoto(1)]);
        setNextId(2);
        setErrore(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Dumbbell className="text-emerald-700" />
                        I miei allenamenti
                    </h1>

                    <button
                        onClick={() => setMostraModal(true)}
                        className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Nuovo allenamento
                    </button>
                </div>

                <section className="flex flex-col gap-3">
                    {loading ? (
                        <p className="text-center text-slate-400">Caricamento...</p>
                    ) : storico.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>Nessun allenamento registrato.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {storico.map((log) => (
                                <li
                                    key={log.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                                >
                                    <div className="px-5 py-4 flex flex-col gap-2">
                                        <span className="text-sm font-bold text-slate-700">
                                            {new Date(log.data).toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </span>

                                        <span className="text-sm text-slate-500">
                                            {log.note || 'Nessuna nota'}
                                        </span>

                                        <button
                                            onClick={() => toggleCommenti(log.id)}
                                            className="mt-1 flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 transition-colors w-fit cursor-pointer"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            Commenti del coach
                                            {commentiAperti === log.id ? (
                                                <ChevronUp className="w-3 h-3" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>

                                    {commentiAperti === log.id && (
                                        <CommentoAllenamentoComponent
                                            commenti={commentiMap[log.id] ?? []}
                                            loading={loadingCommentiMap[log.id] ?? false}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            {mostraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="text-emerald-600" />
                                    Registra Sessione
                                </h2>
                                <button type="button" onClick={() => setMostraModal(false)}>
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
                                            setEsercizi([...esercizi, esercizioVuoto(nextId)]);
                                            setNextId(nextId + 1);
                                        }}
                                        className="text-emerald-700 text-sm font-bold"
                                    >
                                        + Aggiungi
                                    </button>
                                </div>

                                {esercizi.map((ex, i) => (
                                    <ExerciseCard
                                        key={ex.id}
                                        esercizio={ex}
                                        index={i}
                                        onRemove={(id) =>
                                            setEsercizi(esercizi.filter(e => e.id !== id))
                                        }
                                        onChange={(id, f, v) =>
                                            setEsercizi(esercizi.map(e =>
                                                e.id === id ? { ...e, [f]: v } : e
                                            ))
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
                                className="bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50"
                            >
                                {salvataggio ? 'Salvataggio...' : 'Salva Allenamento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}