import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getStorico, salvaLog } from '../api/allenamentoApi';
import type { LogAllenamento } from '../types';
import { Trophy, X, Calendar, Plus, Trash2, Dumbbell } from 'lucide-react';

// -------------------------------------------------------
// Tipi locali per la gestione degli esercizi nel form
// -------------------------------------------------------
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

// -------------------------------------------------------
// ExerciseCard
// -------------------------------------------------------
function ExerciseCard({
                          esercizio,
                          index,
                          onChange,
                          onRemove,
                      }: {
    esercizio: EsercizioForm;
    index: number;
    onChange: (id: number, field: keyof EsercizioForm, value: string) => void;
    onRemove: (id: number) => void;
}) {
    return (
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">

            {/* Header card */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                    Esercizio {index + 1}
                </span>
                <button
                    type="button"
                    onClick={() => onRemove(esercizio.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600
                               transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Rimuovi
                </button>
            </div>

            {/* Nome esercizio */}
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
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               bg-white placeholder-slate-300 text-slate-700
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all"
                />
            </div>

            {/* Grid parametri */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { field: 'serie',       label: 'Serie',       placeholder: 'es. 4' },
                    { field: 'ripetizioni', label: 'Ripetizioni', placeholder: 'es. 10' },
                    { field: 'peso',        label: 'Peso (kg)',   placeholder: 'es. 80' },
                    { field: 'durata',      label: 'Durata (min)',placeholder: 'es. 5'  },
                ].map(({ field, label, placeholder }) => (
                    <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">{label}</label>
                        <input
                            type="number"
                            value={esercizio[field as keyof EsercizioForm]}
                            onChange={(e) => onChange(esercizio.id, field as keyof EsercizioForm, e.target.value)}
                            placeholder={placeholder}
                            min={0}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm
                                       bg-white placeholder-slate-300 text-slate-700
                                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                       transition-all"
                        />
                    </div>
                ))}
            </div>

            {/* Note esercizio */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Note</label>
                <input
                    type="text"
                    value={esercizio.commento}
                    onChange={(e) => onChange(esercizio.id, 'commento', e.target.value)}
                    placeholder="Note specifiche su questo esercizio..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               bg-white placeholder-slate-300 text-slate-700
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               transition-all"
                />
            </div>
        </div>
    );
}

// -------------------------------------------------------
// LogAllenamentoPage
// -------------------------------------------------------
export default function LogAllenamentoPage() {
    const [storico, setStorico] = useState<LogAllenamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostraModal, setMostraModal] = useState(false);

    // Campi form
    const [data, setData] = useState('');
    const [note, setNote] = useState('');
    const [esercizi, setEsercizi] = useState<EsercizioForm[]>([esercizioVuoto(1)]);
    const [nextId, setNextId] = useState(2);
    const [salvataggio, setSalvataggio] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);

    useEffect(() => {
        caricaStorico();
    }, []);

    const caricaStorico = async () => {
        try {
            const logs = await getStorico();
            setStorico(logs);
        } catch (err) {
            console.error('Errore caricamento storico:', err);
        } finally {
            setLoading(false);
        }
    };

    const aggiungiEsercizio = () => {
        setEsercizi(prev => [...prev, esercizioVuoto(nextId)]);
        setNextId(prev => prev + 1);
    };

    const rimuoviEsercizio = (id: number) => {
        if (esercizi.length === 1) return; // almeno uno
        setEsercizi(prev => prev.filter(e => e.id !== id));
    };

    const aggiornaEsercizio = (id: number, field: keyof EsercizioForm, value: string) => {
        setEsercizi(prev =>
            prev.map(e => e.id === id ? { ...e, [field]: value } : e)
        );
    };

    const resetForm = () => {
        setData('');
        setNote('');
        setEsercizi([esercizioVuoto(1)]);
        setNextId(2);
        setErrore(null);
    };

    const chiudiModal = () => {
        setMostraModal(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrore(null);
        setSalvataggio(true);
        try {
            const nuovoLog = await salvaLog({ data, note: note || null });
            setStorico(prev => [nuovoLog, ...prev]);
            chiudiModal();
        } catch {
            setErrore('Errore durante il salvataggio. Riprova.');
        } finally {
            setSalvataggio(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header pagina */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Dumbbell className="w-6 h-6 text-emerald-700" />
                        <h1 className="text-2xl font-bold text-slate-800">I miei allenamenti</h1>
                    </div>
                    <button
                        onClick={() => setMostraModal(true)}
                        className="flex items-center gap-2 text-sm bg-emerald-700 hover:bg-emerald-800
                                   text-white font-semibold px-4 py-2 rounded-lg transition-colors
                                   shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Nuovo allenamento
                    </button>
                </div>

                {/* Storico */}
                <section className="flex flex-col gap-3">
                    {loading ? (
                        <p className="text-sm text-slate-400">Caricamento...</p>
                    ) : storico.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nessun allenamento registrato.</p>
                            <p className="text-xs mt-1">Premi "Nuovo allenamento" per iniziare!</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {storico.map((log) => (
                                <li
                                    key={log.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4
                                               flex flex-col gap-1"
                                >
                                    <span className="text-sm font-semibold text-slate-700">
                                        {new Date(log.data).toLocaleDateString('it-IT', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    {log.note
                                        ? <span className="text-sm text-slate-500">{log.note}</span>
                                        : <span className="text-xs text-slate-300 italic">Nessuna nota</span>
                                    }
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            {/* ── MODAL ── */}
            {mostraModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center
                               bg-black/40 backdrop-blur-sm px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) chiudiModal(); }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl
                                    max-h-[90vh] overflow-y-auto">

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">

                            {/* Header modal */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-emerald-600" />
                                    <h2 className="text-xl font-bold text-slate-800">
                                        Nuovo allenamento
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={chiudiModal}
                                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Metadati: data + note */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Data */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-600">
                                        Data <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={data}
                                            onChange={(e) => setData(e.target.value)}
                                            required
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                                                       text-slate-700 bg-white
                                                       focus:outline-none focus:ring-2 focus:ring-emerald-500
                                                       focus:border-transparent transition-all pr-10"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2
                                                             w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Note generali */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-600">
                                        Note generali
                                    </label>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Es. Giornata di forza, buona energia..."
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                                                   text-slate-700 bg-white placeholder-slate-300
                                                   focus:outline-none focus:ring-2 focus:ring-emerald-500
                                                   focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Sezione esercizi */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-end justify-between">
                                    <h3 className="font-semibold text-slate-700">Esercizi svolti</h3>
                                    <button
                                        type="button"
                                        onClick={aggiungiEsercizio}
                                        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100
                                                   text-emerald-700 text-sm font-medium
                                                   px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Aggiungi
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {esercizi.map((esercizio, index) => (
                                        <ExerciseCard
                                            key={esercizio.id}
                                            esercizio={esercizio}
                                            index={index}
                                            onChange={aggiornaEsercizio}
                                            onRemove={rimuoviEsercizio}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Errore */}
                            {errore && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200
                                             rounded-lg px-4 py-2">
                                    {errore}
                                </p>
                            )}

                            {/* Footer */}
                            <div className="flex justify-end items-center gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={chiudiModal}
                                    className="text-sm text-slate-500 hover:text-slate-700
                                               transition-colors cursor-pointer"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={salvataggio}
                                    className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50
                                               disabled:cursor-not-allowed text-white font-bold
                                               py-2 px-6 rounded-lg shadow-md transition-colors cursor-pointer"
                                >
                                    {salvataggio ? 'Salvataggio...' : 'Salva allenamento'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}