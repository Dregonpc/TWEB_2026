import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import {
    getSchedeCoach,
    creaScheda,
    aggiungiEsercizioScheda,
    getEserciziScheda,
    eliminaScheda,
} from '../api/allenamentoApi';
import { getListaUtenti } from '../api/utenteApi';
import type { SchedaAllenamento, Utente, EsercizioScheda } from '../types';
import {ClipboardList, Plus, X, Trash2, UserPlus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface EsercizioSchedaForm {
    id: number;
    nomeEsercizio: string;
    serie: string;
    ripetizioni: string;
    note: string;
}

const esercizioVuoto = (id: number): EsercizioSchedaForm => ({
    id,
    nomeEsercizio: '',
    serie: '',
    ripetizioni: '',
    note: '',
});

function ExerciseCard({
                          esercizio,
                          index,
                          onChange,
                          onRemove,
                      }: {
    esercizio: EsercizioSchedaForm;
    index: number;
    onChange: (id: number, field: keyof EsercizioSchedaForm, value: string) => void;
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

            <div className="grid grid-cols-2 gap-2">
                {[
                    { field: 'serie', label: 'Serie', placeholder: 'es. 4' },
                    { field: 'ripetizioni', label: 'Ripetizioni', placeholder: 'es. 10' },
                ].map(({ field, label, placeholder }) => (
                    <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400">{label}</label>

                        <input
                            type="number"
                            value={esercizio[field as keyof EsercizioSchedaForm]}
                            onChange={(e) =>
                                onChange(
                                    esercizio.id,
                                    field as keyof EsercizioSchedaForm,
                                    e.target.value
                                )
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
                    value={esercizio.note}
                    onChange={(e) => onChange(esercizio.id, 'note', e.target.value)}
                    placeholder="Note specifiche..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>
        </div>
    );
}

export default function SchedeCoachPage() {
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [loading, setLoading] = useState(true);

    const [mostraModal, setMostraModal] = useState(false);
    const [titolo, setTitolo] = useState('');
    const [utenteId, setUtenteId] = useState('');
    const [noteGenerali, setNoteGenerali] = useState('');
    const [esercizi, setEsercizi] = useState<EsercizioSchedaForm[]>([esercizioVuoto(1)]);
    const [nextId, setNextId] = useState(2);
    const [salvataggio, setSalvataggio] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);

    const [eserciziSchedaMap, setEserciziSchedaMap] = useState<Record<number, EsercizioScheda[]>>({});
    const [loadingEserciziMap, setLoadingEserciziMap] = useState<Record<number, boolean>>({});
    const [schedaAperta, setSchedaAperta] = useState<number | null>(null);

    const [confermaEliminaId, setConfermaEliminaId] = useState<number | null>(null);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);
    const [erroreElimina, setErroreElimina] = useState<string | null>(null);

    useEffect(() => {
        caricaDati();
    }, []);

    const caricaDati = async () => {
        try {
            const [listaSchede, listaUtenti] = await Promise.all([
                getSchedeCoach(),
                getListaUtenti(),
            ]);

            setSchede(listaSchede as SchedaAllenamento[]);
            setUtenti(listaUtenti as Utente[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleEserciziScheda = async (schedaId: number) => {
        if (schedaAperta === schedaId) {
            setSchedaAperta(null);
            return;
        }

        setSchedaAperta(schedaId);

        if (!eserciziSchedaMap[schedaId]) {
            setLoadingEserciziMap(prev => ({ ...prev, [schedaId]: true }));

            try {
                const esercizi = await getEserciziScheda(schedaId);
                setEserciziSchedaMap(prev => ({
                    ...prev,
                    [schedaId]: esercizi as EsercizioScheda[],
                }));
            } catch (err) {
                console.error('Errore caricamento esercizi scheda:', err);
            } finally {
                setLoadingEserciziMap(prev => ({ ...prev, [schedaId]: false }));
            }
        }
    };

    const resetForm = () => {
        setTitolo('');
        setUtenteId('');
        setNoteGenerali('');
        setEsercizi([esercizioVuoto(1)]);
        setNextId(2);
        setErrore(null);
    };

    const closeModal = () => {
        setMostraModal(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvataggio(true);
        setErrore(null);

        try {
            const eserciziValidi = esercizi.filter(
                ex => ex.nomeEsercizio.trim() !== ''
            );

            if (!utenteId) {
                throw new Error('Seleziona un atleta');
            }

            if (!titolo.trim()) {
                throw new Error('Inserisci il titolo della scheda');
            }

            if (eserciziValidi.length === 0) {
                throw new Error('Inserisci almeno un esercizio');
            }

            const dataCreazione = new Date().toISOString().split('T')[0];

            const nuovaScheda = await creaScheda({
                titolo: titolo.trim(),
                dataCreazione,
                note: noteGenerali.trim() || null,
                utente: {
                    id: parseInt(utenteId, 10),
                } as Utente,
            });

            await Promise.all(
                eserciziValidi.map(ex =>
                    aggiungiEsercizioScheda({
                        nomeEsercizio: ex.nomeEsercizio.trim(),
                        serie: ex.serie ? parseInt(ex.serie, 10) : null,
                        ripetizioni: ex.ripetizioni ? parseInt(ex.ripetizioni, 10) : null,
                        note: ex.note.trim() || null,
                        schedaAllenamento: {
                            id: (nuovaScheda as SchedaAllenamento).id,
                        } as SchedaAllenamento,
                    } as any)
                )
            );

            await caricaDati();
            closeModal();
        } catch (err) {
            setErrore(
                err instanceof Error
                    ? err.message
                    : 'Errore nel salvataggio della scheda.'
            );
        } finally {
            setSalvataggio(false);
        }
    };

    const handleConfermaElimina = async (schedaId: number) => {
        setErroreElimina(null);
        setEliminandoId(schedaId);

        try {
            await eliminaScheda(schedaId);

            setSchede(prev => prev.filter(s => s.id !== schedaId));
            setConfermaEliminaId(null);

            setEserciziSchedaMap(prev => {
                const nuovaMappa = { ...prev };
                delete nuovaMappa[schedaId];
                return nuovaMappa;
            });

            if (schedaAperta === schedaId) {
                setSchedaAperta(null);
            }
        } catch {
            setErroreElimina("Errore durante l'eliminazione. Riprova.");
        } finally {
            setEliminandoId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardList className="text-green-700" />
                        Gestione schede
                    </h1>

                    <button
                        onClick={() => setMostraModal(true)}
                        className="bg-green-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Plus size={18} />
                        Nuova scheda
                    </button>
                </div>

                <section className="flex flex-col gap-3">
                    {loading ? (
                        <p className="text-center text-slate-400">Caricamento...</p>
                    ) : schede.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>Nessuna scheda creata.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {schede.map((scheda) => (
                                <li
                                    key={scheda.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                                >
                                    <div className="px-5 py-4 flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-sm font-bold text-slate-700">
                                                {scheda.titolo}
                                            </span>

                                            {confermaEliminaId === scheda.id ? (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Sicuro?
                                                    </span>

                                                    <button
                                                        onClick={() => handleConfermaElimina(scheda.id)}
                                                        disabled={eliminandoId === scheda.id}
                                                        className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        {eliminandoId === scheda.id
                                                            ? 'Eliminazione...'
                                                            : 'Elimina'}
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setConfermaEliminaId(null);
                                                            setErroreElimina(null);
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                                    >
                                                        Annulla
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setConfermaEliminaId(scheda.id);
                                                        setErroreElimina(null);
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                                    title="Elimina scheda"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {erroreElimina && confermaEliminaId === scheda.id && (
                                            <p className="text-xs text-red-500">{erroreElimina}</p>
                                        )}

                                        <span className="text-sm text-slate-500">
                                            {scheda.utente?.nome} {scheda.utente?.cognome}
                                        </span>

                                        <span className="text-sm text-slate-400">
                                            {scheda.note || 'Nessuna nota'}
                                        </span>

                                        <span className="text-xs text-slate-400">
                                            Data creazione:{' '}
                                            {scheda.dataCreazione
                                                ? new Date(scheda.dataCreazione).toLocaleDateString('it-IT')
                                                : 'Non disponibile'}
                                        </span>

                                        <button
                                            onClick={() => toggleEserciziScheda(scheda.id)}
                                            className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors w-fit cursor-pointer"
                                        >
                                            <ClipboardList className="w-3.5 h-3.5" />
                                            Esercizi della scheda
                                            {schedaAperta === scheda.id ? (
                                                <ChevronUp className="w-3 h-3" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>

                                    {schedaAperta === scheda.id && (
                                        <div className="border-t border-gray-100 bg-slate-50 px-5 py-4 flex flex-col gap-3">
                                            {loadingEserciziMap[scheda.id] ? (
                                                <p className="text-xs text-gray-400">
                                                    Caricamento esercizi...
                                                </p>
                                            ) : (eserciziSchedaMap[scheda.id] ?? []).length === 0 ? (
                                                <p className="text-xs text-gray-400">
                                                    Nessun esercizio nella scheda.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {(eserciziSchedaMap[scheda.id] ?? []).map((es: any) => (
                                                        <div
                                                            key={es.id}
                                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-semibold text-slate-700">
                                                                    {es.nomeEsercizio}
                                                                </span>

                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                                    {es.serie != null && (
                                                                        <span>Serie: {es.serie}</span>
                                                                    )}
                                                                    {es.ripetizioni != null && (
                                                                        <span>Ripetizioni: {es.ripetizioni}</span>
                                                                    )}
                                                                </div>

                                                                {es.note && (
                                                                    <p className="text-xs text-slate-400 italic">
                                                                        {es.note}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
                                    <UserPlus className="text-emerald-600" />
                                    Crea scheda
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <X />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={titolo}
                                    onChange={e => setTitolo(e.target.value)}
                                    placeholder="Titolo scheda..."
                                    required
                                    className="border p-2 rounded-lg text-sm"
                                />

                                <select
                                    value={utenteId}
                                    onChange={e => setUtenteId(e.target.value)}
                                    required
                                    className="border p-2 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Seleziona atleta...</option>

                                    {utenti.map((utente) => (
                                        <option key={utente.id} value={utente.id}>
                                            {utente.nome} {utente.cognome} (@{utente.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <input
                                type="text"
                                value={noteGenerali}
                                onChange={e => setNoteGenerali(e.target.value)}
                                placeholder="Note generali..."
                                className="border p-2 rounded-lg text-sm"
                            />

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
                                        onRemove={(id) =>
                                            setEsercizi(prev =>
                                                prev.length > 1
                                                    ? prev.filter(e => e.id !== id)
                                                    : prev
                                            )
                                        }
                                        onChange={(id, field, value) =>
                                            setEsercizi(prev =>
                                                prev.map(e =>
                                                    e.id === id ? { ...e, [field]: value } : e
                                                )
                                            )
                                        }
                                    />
                                ))}
                            </div>

                            {errore && (
                                <p className="text-sm text-red-500">{errore}</p>
                            )}

                            <button
                                type="submit"
                                disabled={salvataggio}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {salvataggio ? 'Salvataggio...' : 'Salva scheda'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}