import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import {
    getLogAllenamento,
    getSchedeUtente,
    postLogAllenamento,
    deleteLogAllenamento,
    type EsercizioSvoltoInput,
} from '../api/logAllenamentoApi';
import type { LogAllenamento } from '../types/LogAllenamento';
import type { SchedaAllenamento } from '../types/SchedaAllenamento';

// Tipi form

interface FormEsercizio {
    nomeEsercizio: string;
    serie: string;
    ripetizioni: string;
    peso: string;
    durata: string;
    note: string;
}

const esercizioVuoto = (): FormEsercizio => ({
    nomeEsercizio: '',
    serie: '',
    ripetizioni: '',
    peso: '',
    durata: '',
    note: '',
});

// Componenti UI

function Badge({ testo, colore }: { testo: string; colore: string }) {
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colore}`}>
            {testo}
        </span>
    );
}

// Card di un log allenamento
function CardLog({
    log,
    onElimina,
    onClick,
}: {
    log: LogAllenamento;
    onElimina: (id: number) => void;
    onClick: (log: LogAllenamento) => void;
}) {
    const data = new Date(log.data).toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3
                        hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="font-semibold text-gray-800 capitalize">{data}</div>
                    {log.note && (
                        <div className="text-sm text-gray-400 mt-0.5 line-clamp-2">{log.note}</div>
                    )}
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => onClick(log)}
                        className="text-xs text-green-700 hover:text-green-800 font-medium cursor-pointer"
                    >
                        Dettagli →
                    </button>
                    <button
                        onClick={() => onElimina(log.id)}
                        className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                    >
                        Elimina
                    </button>
                </div>
            </div>

            {/* Pill con numero esercizi se disponibile */}
            {log.esercizi && log.esercizi.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {log.esercizi.slice(0, 4).map((e, i) => (
                        <Badge key={i} testo={e.nomeEsercizio} colore="bg-green-50 text-green-700" />
                    ))}
                    {log.esercizi.length > 4 && (
                        <Badge
                            testo={`+${log.esercizi.length - 4} altri`}
                            colore="bg-gray-100 text-gray-500"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// Riga esercizio nel form
function RigaEsercizio({
    esercizio,
    index,
    onChange,
    onRimuovi,
    totale,
}: {
    esercizio: FormEsercizio;
    index: number;
    onChange: (i: number, campo: keyof FormEsercizio, val: string) => void;
    onRimuovi: (i: number) => void;
    totale: number;
}) {
    const input = 'border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-400';

    return (
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Esercizio {index + 1}</span>
                {totale > 1 && (
                    <button
                        type="button"
                        onClick={() => onRimuovi(index)}
                        className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                    >
                        Rimuovi
                    </button>
                )}
            </div>

            {/* Nome */}
            <input
                className={input}
                placeholder="Nome esercizio *"
                value={esercizio.nomeEsercizio}
                onChange={e => onChange(index, 'nomeEsercizio', e.target.value)}
                required
            />

            {/* Dati numerici */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Serie</label>
                    <input
                        type="number" min="1" className={input} placeholder="es. 3"
                        value={esercizio.serie}
                        onChange={e => onChange(index, 'serie', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Ripetizioni</label>
                    <input
                        type="number" min="1" className={input} placeholder="es. 10"
                        value={esercizio.ripetizioni}
                        onChange={e => onChange(index, 'ripetizioni', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
                    <input
                        type="number" min="0" step="0.5" className={input} placeholder="es. 80"
                        value={esercizio.peso}
                        onChange={e => onChange(index, 'peso', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Durata (min)</label>
                    <input
                        type="number" min="0" className={input} placeholder="es. 20"
                        value={esercizio.durata}
                        onChange={e => onChange(index, 'durata', e.target.value)}
                    />
                </div>
            </div>

            {/* Note */}
            <input
                className={input}
                placeholder="Note (opzionale)"
                value={esercizio.note}
                onChange={e => onChange(index, 'note', e.target.value)}
            />
        </div>
    );
}

// Modale per creare un nuovo log
function ModalNuovoLog({
    onChiudi,
    onSalvato,
}: {
    onChiudi: () => void;
    onSalvato: (log: LogAllenamento) => void;
}) {
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [esercizi, setEsercizi] = useState<FormEsercizio[]>([esercizioVuoto()]);
    const [caricamento, setCaricamento] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);

    const aggiornaEsercizio = (i: number, campo: keyof FormEsercizio, val: string) => {
        setEsercizi(prev => prev.map((e, idx) => idx === i ? { ...e, [campo]: val } : e));
    };

    const aggiungiEsercizio = () => setEsercizi(prev => [...prev, esercizioVuoto()]);

    const rimuoviEsercizio = (i: number) =>
        setEsercizi(prev => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrore(null);

        // Validazione
        if (esercizi.some(e => !e.nomeEsercizio.trim())) {
            setErrore('Inserisci il nome per ogni esercizio.');
            return;
        }

        const payload = {
            data,
            note: note.trim() || undefined,
            esercizi: esercizi.map(e => ({
                nomeEsercizio: e.nomeEsercizio.trim(),
                serie: e.serie ? parseInt(e.serie) : undefined,
                ripetizioni: e.ripetizioni ? parseInt(e.ripetizioni) : undefined,
                peso: e.peso ? parseFloat(e.peso) : undefined,
                durata: e.durata ? parseInt(e.durata) : undefined,
                note: e.note.trim() || undefined,
            } satisfies EsercizioSvoltoInput)),
        };

        setCaricamento(true);
        try {
            const nuovo = await postLogAllenamento(payload);
            onSalvato(nuovo);
        } catch {
            setErrore('Errore nel salvataggio. Riprova.');
        } finally {
            setCaricamento(false);
        }
    };

    return (
        // Overlay
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) onChiudi(); }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">🏋️ Nuovo allenamento</h2>
                    <button
                        onClick={onChiudi}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Data e note generali */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">
                                Data *
                            </label>
                            <input
                                type="date"
                                required
                                value={data}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={e => setData(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full
                                           focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">
                                Note generali
                            </label>
                            <input
                                type="text"
                                placeholder="es. Mi sono sentito bene…"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full
                                           focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                    </div>

                    {/* Esercizi */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">Esercizi svolti</h3>
                            <button
                                type="button"
                                onClick={aggiungiEsercizio}
                                className="text-xs bg-green-50 text-green-700 hover:bg-green-100
                                           px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                + Aggiungi esercizio
                            </button>
                        </div>

                        {esercizi.map((e, i) => (
                            <RigaEsercizio
                                key={i}
                                esercizio={e}
                                index={i}
                                onChange={aggiornaEsercizio}
                                onRimuovi={rimuoviEsercizio}
                                totale={esercizi.length}
                            />
                        ))}
                    </div>

                    {/* Errore */}
                    {errore && (
                        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                            {errore}
                        </div>
                    )}

                    {/* Azioni */}
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onChiudi}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={caricamento}
                            className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white text-sm
                                       font-semibold rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            {caricamento ? 'Salvataggio…' : 'Salva allenamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Pagina principale

export default function LogAllenamentoPage() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogAllenamento[]>([]);
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostraModal, setMostraModal] = useState(false);
    const [tab, setTab] = useState<'log' | 'schede'>('log');
    const [errore, setErrore] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([getLogAllenamento(), getSchedeUtente()])
            .then(([l, s]) => {
                setLogs(l.sort((a, b) => b.data.localeCompare(a.data)));
                setSchede(s);
            })
            .catch(() => setErrore('Errore nel caricamento dei dati.'))
            .finally(() => setLoading(false));
    }, []);

    const handleElimina = async (id: number) => {
        if (!confirm('Eliminare questo allenamento?')) return;
        try {
            await deleteLogAllenamento(id);
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch {
            alert('Errore nell\'eliminazione.');
        }
    };

    const handleSalvato = (nuovo: LogAllenamento) => {
        setLogs(prev => [nuovo, ...prev]);
        setMostraModal(false);
    };

    const tabClass = (t: 'log' | 'schede') =>
        `px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === t
                ? 'bg-green-700 text-white'
                : 'text-gray-500 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-xs text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1 cursor-pointer"
                        >
                            ← Dashboard
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">🏋️ Allenamento</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Tieni traccia dei tuoi progressi
                        </p>
                    </div>
                    <button
                        onClick={() => setMostraModal(true)}
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm
                                   font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        + Registra allenamento
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button className={tabClass('log')} onClick={() => setTab('log')}>
                        📋 I miei log ({logs.length})
                    </button>
                    <button className={tabClass('schede')} onClick={() => setTab('schede')}>
                        📄 Schede del coach ({schede.length})
                    </button>
                </div>

                {/* Contenuto */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Caricamento…</div>
                ) : errore ? (
                    <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{errore}</div>
                ) : tab === 'log' ? (
                    logs.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="text-5xl">🏃</div>
                            <p className="text-gray-500 font-medium">Nessun allenamento registrato</p>
                            <p className="text-sm text-gray-400">Inizia registrando il tuo primo allenamento!</p>
                            <button
                                onClick={() => setMostraModal(true)}
                                className="mt-2 px-4 py-2 bg-green-700 text-white text-sm
                                           font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer"
                            >
                                Registra ora
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {logs.map(log => (
                                <CardLog
                                    key={log.id}
                                    log={log}
                                    onElimina={handleElimina}
                                    onClick={log => navigate(`/allenamento/${log.id}`)}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    // Tab schede
                    schede.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="text-5xl">📄</div>
                            <p className="text-gray-500 font-medium">Nessuna scheda assegnata</p>
                            <p className="text-sm text-gray-400">Il tuo coach non ti ha ancora assegnato una scheda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {schede.map(s => (
                                <div
                                    key={s.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                                >
                                    <div className="font-semibold text-gray-800">{s.titolo ?? `Scheda #${s.id}`}</div>
                                    {s.descrizione && (
                                        <div className="text-sm text-gray-400 mt-1">{s.descrizione}</div>
                                    )}
                                    {s.dataCreazione && (
                                        <div className="text-xs text-gray-300 mt-3">
                                            Creata il {new Date(s.dataCreazione).toLocaleDateString('it-IT')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* Modale */}
            {mostraModal && (
                <ModalNuovoLog
                    onChiudi={() => setMostraModal(false)}
                    onSalvato={handleSalvato}
                />
            )}
        </div>
    );
}