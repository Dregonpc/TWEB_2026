import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import CommentoAllenamentoComponent from '../components/CommentoAllenamentoComponent';
import {
    getStorico,
    salvaLog,
    getCommentiLog,
    getEserciziLog,
    aggiungiEsercizioSvolto,
    eliminaLog,
} from '../api/allenamentoApi';
import type {
    LogAllenamento,
    CommentoAllenamento,
    EsercizioSvolto
} from '../types';
import {
    Trophy,
    X,
    Plus,
    Trash2,
    Dumbbell,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    AlertTriangle,
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
                    { field: 'durata', label: 'Durata (sec)', placeholder: 'es. 60' },
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

    const [eserciziMap, setEserciziMap] = useState<Record<number, EsercizioSvolto[]>>({});
    const [loadingEserciziMap, setLoadingEserciziMap] = useState<Record<number, boolean>>({});
    const [eserciziAperti, setEserciziAperti] = useState<number | null>(null);

    // Eliminazione: quale log sta aspettando conferma, quale è in corso
    const [confermaEliminaId, setConfermaEliminaId] = useState<number | null>(null);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);
    const [erroreElimina, setErroreElimina] = useState<string | null>(null);

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

    const toggleEsercizi = async (logId: number) => {
        if (eserciziAperti === logId) {
            setEserciziAperti(null);
            return;
        }

        setEserciziAperti(logId);

        if (!eserciziMap[logId]) {
            setLoadingEserciziMap(prev => ({ ...prev, [logId]: true }));
            try {
                const eserciziLog = await getEserciziLog(logId);
                setEserciziMap(prev => ({ ...prev, [logId]: eserciziLog }));
            } catch (err) {
                console.error('Errore caricamento esercizi:', err);
            } finally {
                setLoadingEserciziMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

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

            if (!data) throw new Error('Inserisci la data');
            if (eserciziValidi.length === 0) throw new Error('Inserisci almeno un esercizio');

            const nuovoLog = await salvaLog({
                data,
                note: note.trim() || null,
            });

            await Promise.all(
                eserciziValidi.map(ex =>
                    aggiungiEsercizioSvolto({
                        nomeEsercizio: ex.nomeEsercizio.trim(),
                        serie: ex.serie ? parseInt(ex.serie, 10) : null,
                        ripetizioni: ex.ripetizioni ? parseInt(ex.ripetizioni, 10) : null,
                        peso: ex.peso ? parseInt(ex.peso, 10) : null,
                        durata: ex.durata ? parseInt(ex.durata, 10) : null,
                        commento: ex.commento || null,
                        logAllenamento: { id: nuovoLog.id } as LogAllenamento,
                    } as Partial<EsercizioSvolto>)
                )
            );

            await caricaStorico();
            setMostraModal(false);
            resetForm();
        } catch (err) {
            setErrore(err instanceof Error ? err.message : 'Errore nel salvataggio.');
        } finally {
            setSalvataggio(false);
        }
    };

    // ── Eliminazione ──────────────────────────────────────────────────────────

    const handleConfermaElimina = async (logId: number) => {
        setErroreElimina(null);
        setEliminandoId(logId);
        try {
            await eliminaLog(logId);
            // Rimuovi dallo stato locale senza ricaricare tutto
            setStorico(prev => prev.filter(l => l.id !== logId));
            setConfermaEliminaId(null);
            // Pulizia mappe collegate
            setEserciziMap(prev => { const m = { ...prev }; delete m[logId]; return m; });
            setCommentiMap(prev => { const m = { ...prev }; delete m[logId]; return m; });
        } catch {
            setErroreElimina('Errore durante l\'eliminazione. Riprova.');
        } finally {
            setEliminandoId(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

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
                        className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2 cursor-pointer hover:bg-emerald-800 transition-colors"
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
                                    <div className="px-5 py-4 flex flex-col gap-3">

                                        {/* Riga superiore: data + bottone elimina */}
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-sm font-bold text-slate-700">
                                                {new Date(log.data).toLocaleDateString('it-IT', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </span>

                                            {/* Bottone elimina / conferma inline */}
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
                                                        onClick={() => {
                                                            setConfermaEliminaId(null);
                                                            setErroreElimina(null);
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-slate-600
                                                                   transition-colors cursor-pointer"
                                                    >
                                                        Annulla
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setConfermaEliminaId(log.id);
                                                        setErroreElimina(null);
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-slate-300
                                                               hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                                    title="Elimina allenamento"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Errore eliminazione */}
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
                                                className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 transition-colors w-fit cursor-pointer"
                                            >
                                                <ClipboardList className="w-3.5 h-3.5" />
                                                Esercizi svolti
                                                {eserciziAperti === log.id ? (
                                                    <ChevronUp className="w-3 h-3" />
                                                ) : (
                                                    <ChevronDown className="w-3 h-3" />
                                                )}
                                            </button>

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
                                    </div>

                                    {eserciziAperti === log.id && (
                                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 flex flex-col gap-3">
                                            {loadingEserciziMap[log.id] ? (
                                                <p className="text-xs text-slate-400">
                                                    Caricamento esercizi...
                                                </p>
                                            ) : (eserciziMap[log.id] ?? []).length === 0 ? (
                                                <p className="text-xs text-slate-400">
                                                    Nessun esercizio trovato.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {(eserciziMap[log.id] ?? []).map((esercizio) => (
                                                        <div
                                                            key={esercizio.id}
                                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-semibold text-slate-700">
                                                                    {esercizio.nomeEsercizio}
                                                                </span>

                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                                    {esercizio.serie != null && (
                                                                        <span>Serie: {esercizio.serie}</span>
                                                                    )}
                                                                    {esercizio.ripetizioni != null && (
                                                                        <span>Ripetizioni: {esercizio.ripetizioni}</span>
                                                                    )}
                                                                    {esercizio.peso != null && (
                                                                        <span>Peso: {esercizio.peso} kg</span>
                                                                    )}
                                                                    {esercizio.durata != null && (
                                                                        <span>Durata: {esercizio.durata} sec</span>
                                                                    )}
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
                                            setEsercizi([...esercizi, esercizioVuoto(nextId)]);
                                            setNextId(nextId + 1);
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
                                        onRemove={(id) =>
                                            setEsercizi(esercizi.length > 1
                                                ? esercizi.filter(e => e.id !== id)
                                                : esercizi)
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
                                className="bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 cursor-pointer hover:bg-emerald-800 transition-colors"
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