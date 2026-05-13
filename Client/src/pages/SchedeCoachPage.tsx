import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getSchedeCoach, creaScheda, aggiungiEsercizioScheda } from '../api/allenamentoApi';
import { getListaUtenti } from '../api/utenteApi';
import { apiFetch } from '../api/baseApi';
import type { SchedaAllenamento, Utente, EsercizioScheda } from '../types';
import { ClipboardList, Plus, X, User, Trash2, Dumbbell, Save } from 'lucide-react';

// Interfaccia locale per gestire gli esercizi nel form del coach
interface EsercizioSchedaForm {
    tempId: number;
    nomeEsercizio: string;
    serie: string;
    ripetizioni: string;
    note: string;
}

const esercizioVuoto = (id: number): EsercizioSchedaForm => ({
    tempId: id,
    nomeEsercizio: '',
    serie: '',
    ripetizioni: '',
    note: '',
});

export default function SchedeCoachPage() {
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostraModal, setMostraModal] = useState(false);

    // State del Form Scheda
    const [titolo, setTitolo] = useState('');
    const [noteGenerali, setNoteGenerali] = useState('');
    const [utenteId, setUtenteId] = useState<string>('');

    // State degli Esercizi della Scheda
    const [esercizi, setEsercizi] = useState<EsercizioSchedaForm[]>([esercizioVuoto(1)]);
    const [nextId, setNextId] = useState(2);

    const [salvataggio, setSalvataggio] = useState(false);

    useEffect(() => {
        caricaDati();
    }, []);

    const caricaDati = async () => {
        try {
            const [listaSchede, listaUtenti] = await Promise.all([
                getSchedeCoach(),
                getListaUtenti()
            ]);
            setSchede(listaSchede);
            setUtenti(listaUtenti);
        } catch (err) {
            console.error("Errore caricamento", err);
        } finally {
            setLoading(false);
        }
    };

    const aggiungiEsercizio = () => {
        setEsercizi([...esercizi, esercizioVuoto(nextId)]);
        setNextId(nextId + 1);
    };

    const rimuoviEsercizio = (id: number) => {
        if (esercizi.length > 1) {
            setEsercizi(esercizi.filter(e => e.tempId !== id));
        }
    };

    const aggiornaEsercizio = (id: number, field: keyof EsercizioSchedaForm, value: string) => {
        setEsercizi(esercizi.map(e => e.tempId === id ? { ...e, [field]: value } : e));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!utenteId) return alert("Seleziona un atleta!");

        setSalvataggio(true);
        try {
            // 1. Crea la testata della Scheda
            const nuovaScheda = await creaScheda({
                titolo,
                note: noteGenerali,
                utente: { id: parseInt(utenteId) } as Utente
            });

            // 2. Cicla sugli esercizi e salvali collegandoli alla scheda appena creata
            const promesseEsercizi = esercizi.map(ex =>
                aggiungiEsercizioScheda({
                    nomeEsercizio: ex.nomeEsercizio,
                    serie: ex.serie ? parseInt(ex.serie) : null,
                    ripetizioni: ex.ripetizioni ? parseInt(ex.ripetizioni) : null,
                    note: ex.note || null,
                    scheda: nuovaScheda // Colleghiamo l'esercizio alla scheda
                })
            );

            await Promise.all(promesseEsercizi);

            // Reset e chiusura
            alert("Scheda creata con successo!");
            setMostraModal(false);
            setTitolo(''); setNoteGenerali(''); setUtenteId('');
            setEsercizi([esercizioVuoto(1)]);
            caricaDati(); // Refresh lista
        } catch (err) {
            alert("Errore durante il salvataggio della scheda");
        } finally {
            setSalvataggio(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <ClipboardList className="text-emerald-700" /> Gestione Schede Atleti
                    </h1>
                    <button
                        onClick={() => setMostraModal(true)}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold shadow-md flex items-center gap-2 hover:bg-emerald-700 transition-all"
                    >
                        <Plus size={20}/> Nuova Scheda
                    </button>
                </div>

                {loading ? <p className="text-center text-slate-400">Caricamento...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schede.map(s => (
                            <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-800">{s.titolo}</h3>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase">Scheda Attiva</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                                    <User size={14} className="text-emerald-500"/>
                                    <span>Atleta: <b>{s.utente.nome} {s.utente.cognome}</b></span>
                                </div>
                                <p className="text-sm text-slate-600 italic mt-2 line-clamp-2">{s.note || 'Nessuna nota aggiuntiva'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL CREAZIONE SCHEDA (DESIGN VERDE) */}
            {mostraModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">

                        {/* Header Modal */}
                        <div className="p-6 border-b flex justify-between items-center bg-emerald-50 rounded-t-3xl">
                            <div>
                                <h2 className="text-2xl font-bold text-emerald-900">Crea Programma Allenamento</h2>
                                <p className="text-sm text-emerald-600">Inserisci titolo, atleta ed esercizi</p>
                            </div>
                            <button onClick={() => setMostraModal(false)} className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 flex flex-col gap-8">

                            {/* Sezione 1: Info Base */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Titolo Scheda</label>
                                    <input
                                        type="text"
                                        placeholder="Es: Massa Muscolare A"
                                        className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={titolo}
                                        onChange={e => setTitolo(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Assegna a Atleta</label>
                                    <select
                                        className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                        value={utenteId}
                                        onChange={e => setUtenteId(e.target.value)}
                                        required
                                    >
                                        <option value="">Scegli un atleta...</option>
                                        {utenti.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Sezione 2: Esercizi (Il form verde) */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Dumbbell className="text-emerald-600" size={20}/> Lista Esercizi
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={aggiungiEsercizio}
                                        className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                    >
                                        + Aggiungi Esercizio
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {esercizi.map((ex, index) => (
                                        <div key={ex.tempId} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl relative animate-in fade-in slide-in-from-top-2">
                                            <button
                                                type="button"
                                                onClick={() => rimuoviEsercizio(ex.tempId)}
                                                className="absolute top-4 right-4 text-emerald-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18}/>
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="md:col-span-2">
                                                    <label className="text-[10px] uppercase font-bold text-emerald-700 mb-1 block">Nome Esercizio</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Panca Piana, Squat..."
                                                        className="w-full bg-white border border-emerald-100 p-2 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                        value={ex.nomeEsercizio}
                                                        onChange={e => aggiornaEsercizio(ex.tempId, 'nomeEsercizio', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-emerald-700 mb-1 block">Serie</label>
                                                        <input
                                                            type="number"
                                                            placeholder="4"
                                                            className="w-full bg-white border border-emerald-100 p-2 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                            value={ex.serie}
                                                            onChange={e => aggiornaEsercizio(ex.tempId, 'serie', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-emerald-700 mb-1 block">Reps</label>
                                                        <input
                                                            type="number"
                                                            placeholder="10"
                                                            className="w-full bg-white border border-emerald-100 p-2 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                            value={ex.ripetizioni}
                                                            onChange={e => aggiornaEsercizio(ex.tempId, 'ripetizioni', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-emerald-700 mb-1 block">Note Esercizio (es. recupero 90s)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Aggiungi dettagli..."
                                                    className="w-full bg-white border border-emerald-100 p-2 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    value={ex.note}
                                                    onChange={e => aggiornaEsercizio(ex.tempId, 'note', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sezione 3: Note Generali Scheda */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Note Generali Scheda</label>
                                <textarea
                                    placeholder="Istruzioni per l'intero programma..."
                                    className="border border-slate-200 p-3 rounded-xl h-24 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    value={noteGenerali}
                                    onChange={e => setNoteGenerali(e.target.value)}
                                />
                            </div>

                            {/* Footer Modal */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setMostraModal(false)}
                                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                >
                                    Annulla
                                </button>
                                <button
                                    disabled={salvataggio}
                                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                                >
                                    {salvataggio ? 'Salvataggio...' : <><Save size={20}/> Salva Programma</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}