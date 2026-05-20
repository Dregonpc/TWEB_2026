import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import DietaCard from '../components/DietaCard';
import {
    creaDieta,
    getDieteCoach
} from '../api/dietaApi';
import { getListaUtenti } from '../api/utenteApi';
import type { Dieta, Utente } from '../types';
import {
    Salad,
    Plus,
    X,
    User,
    Save
} from 'lucide-react';

export default function DieteCoachPage() {

    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [dieteCreate, setDieteCreate] = useState<Dieta[]>([]);

    const [loading, setLoading] = useState(true);

    const [mostraForm, setMostraForm] = useState(false);

    const [salvataggio, setSalvataggio] = useState(false);

    // Form state
    const [titolo, setTitolo] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [utenteId, setUtenteId] = useState('');

    useEffect(() => {

        Promise.all([
            getListaUtenti(),
            getDieteCoach()
        ])
            .then(([utentiData, dieteData]) => {

                setUtenti(utentiData);
                setDieteCreate(dieteData);

            })
            .catch(console.error)
            .finally(() => setLoading(false));

    }, []);

    const resetForm = () => {

        setTitolo('');
        setDescrizione('');
        setUtenteId('');

        setMostraForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!utenteId) {
            return alert('Seleziona un atleta!');
        }

        setSalvataggio(true);

        try {

            await creaDieta({
                titolo,
                descrizione,
                utente: {
                    id: parseInt(utenteId)
                } as Utente,
            });

            // refresh completo
            const dieteAggiornate = await getDieteCoach();

            setDieteCreate(dieteAggiornate);

            resetForm();

        } catch {

            alert('Errore durante il salvataggio della dieta');

        } finally {

            setSalvataggio(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <NavBar />

            <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <Salad className="w-6 h-6 text-emerald-600" />

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Gestione Diete
                            </h1>

                            <p className="text-sm text-slate-400">
                                Crea e assegna piani alimentari agli atleti
                            </p>
                        </div>
                    </div>

                    {!mostraForm && (
                        <button
                            onClick={() => setMostraForm(true)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
                            text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                            <Plus className="w-4 h-4" />

                            Nuova dieta
                        </button>
                    )}
                </div>

                {/* FORM */}
                {mostraForm && (

                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">

                        {/* Header form */}
                        <div className="flex items-center justify-between px-6 py-4
                        bg-emerald-50 border-b border-emerald-100">

                            <h2 className="font-bold text-emerald-900">
                                Nuova dieta
                            </h2>

                            <button
                                onClick={resetForm}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 flex flex-col gap-5"
                        >

                            {/* Titolo + atleta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Titolo */}
                                <div className="flex flex-col gap-1.5">

                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        Titolo piano
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Es. Piano ipocalorico estate"
                                        required
                                        value={titolo}
                                        onChange={e => setTitolo(e.target.value)}
                                        className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Utente */}
                                <div className="flex flex-col gap-1.5">

                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        Assegna a
                                    </label>

                                    <div className="relative">

                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                                        <select
                                            required
                                            value={utenteId}
                                            onChange={e => setUtenteId(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl
                                            text-sm bg-white focus:outline-none focus:ring-2
                                            focus:ring-emerald-500 appearance-none"
                                        >

                                            <option value="">
                                                Scegli un atleta...
                                            </option>

                                            {loading ? (

                                                <option disabled>
                                                    Caricamento...
                                                </option>

                                            ) : (

                                                utenti.map(u => (
                                                    <option
                                                        key={u.id}
                                                        value={u.id}
                                                    >
                                                        {u.nome} {u.cognome} (@{u.username})
                                                    </option>
                                                ))

                                            )}

                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Descrizione */}
                            <div className="flex flex-col gap-1.5">

                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    Descrizione / istruzioni
                                </label>

                                <textarea
                                    placeholder="Dettagli del piano alimentare..."
                                    value={descrizione}
                                    onChange={e => setDescrizione(e.target.value)}
                                    rows={5}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                                    text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Annulla
                                </button>

                                <button
                                    type="submit"
                                    disabled={salvataggio}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                    text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700
                                    disabled:opacity-50 transition-colors"
                                >

                                    {salvataggio ? (
                                        'Salvataggio...'
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Salva dieta
                                        </>
                                    )}

                                </button>
                            </div>

                        </form>
                    </div>
                )}

                {/* LISTA DIETE */}
                {dieteCreate.length > 0 && (

                    <div className="flex flex-col gap-3">

                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Diete assegnate
                        </h2>

                        {dieteCreate.map(d => (
                            <DietaCard
                                key={d.id}
                                dieta={d}
                                variant="coach"
                            />
                        ))}

                    </div>
                )}

                {/* Empty state */}
                {!mostraForm && dieteCreate.length === 0 && (

                    <div className="bg-white rounded-xl p-12 flex flex-col items-center gap-3
                    text-center border border-slate-100">

                        <Salad className="w-10 h-10 text-slate-200" />

                        <p className="font-semibold text-slate-400">
                            Nessuna dieta creata
                        </p>

                        <p className="text-sm text-slate-300">
                            Clicca "Nuova dieta" per assegnare un piano alimentare a un atleta
                        </p>

                    </div>
                )}

            </main>
        </div>
    );
}