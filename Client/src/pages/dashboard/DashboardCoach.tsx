import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getListaUtenti } from '../../api/utenteApi';
import { getSchedeCoach } from '../../api/allenamentoApi';
import { getDieteCoach } from '../../api/dietaApi';
import type { Utente, SchedaAllenamento } from '../../types';
import { Users, ClipboardList, Salad, Plus, ChevronRight } from 'lucide-react';
import StatCard from '../../components/StatCard';

export default function DashboardCoach() {
    const { utente } = useAuth();
    const navigate = useNavigate();

    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [diete, setDiete] = useState<Dieta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const caricaDati = async () => {
            try {
                const [listaUtenti, listaSchede, listaDiete] = await Promise.all([
                    getListaUtenti(),
                    getSchedeCoach(),
                    getDieteCoach(),
                ]);
                setUtenti(listaUtenti);
                setSchede(listaSchede);
                setDiete(listaDiete);
            } catch (err) {
                console.error('Errore caricamento dashboard coach:', err);
            } finally {
                setLoading(false);
            }
        };
        caricaDati();
    }, []);

    const oggi = new Date().toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const ora = new Date().getHours();
    const saluto = ora < 12 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {saluto}, {utente?.nome}! 👋
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{oggi}</p>
                </div>

                {/* Grid statistiche */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Utenti seguiti"
                        value={utenti.length}
                        icon={Users}
                        color="orange"
                    />

                    <StatCard
                        title="Schede create"
                        value={schede.length}
                        icon={ClipboardList}
                        color="blue"
                        actionLabel="+ Nuova"
                        onAction={() => navigate('/coach/schede')}
                    />

                    <StatCard
                        title="Diete assegnate"
                        value={diete.length}
                        icon={Salad}
                        color="emerald"
                        actionLabel="+ Nuova"
                        onAction={() => navigate('/coach/dieta')}
                    />
                </div>

                {/* Sezione utenti */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            <h2 className="font-semibold text-gray-700">I miei utenti</h2>
                        </div>
                        <button
                            onClick={() => navigate('/coach/utenti')}
                            className="text-sm text-emerald-600 hover:text-emerald-800
                                       transition-colors cursor-pointer flex items-center gap-1"
                        >
                            Vedi tutti <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : utenti.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessun utente assegnato.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {utenti.slice(0, 6).map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => navigate(`/coach/utente/${u.id}`, { state: { utente: u } })}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg
                                               border border-gray-100 hover:border-emerald-200
                                               hover:bg-emerald-50/50 transition-all text-left cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center
                                                    justify-center text-emerald-700 font-bold text-sm shrink-0">
                                        {u.nome.charAt(0)}{u.cognome.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-gray-700 truncate">
                                            {u.nome} {u.cognome}
                                        </span>
                                        <span className="text-xs text-gray-400 truncate">@{u.username}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/coach/schede')}
                        className="border-2 border-dashed border-gray-200 hover:border-emerald-400
                                   hover:bg-emerald-50/40 rounded-xl p-8 flex flex-col items-center gap-3
                                   transition-all cursor-pointer group"
                    >
                        <ClipboardList className="w-10 h-10 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        <div className="text-center">
                            <p className="font-semibold text-gray-600 group-hover:text-emerald-700 transition-colors">
                                Crea nuova scheda
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Assegna esercizi personalizzati a un utente
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/coach/dieta')}
                        className="border-2 border-dashed border-gray-200 hover:border-orange-400
                                   hover:bg-orange-50/40 rounded-xl p-8 flex flex-col items-center gap-3
                                   transition-all cursor-pointer group"
                    >
                        <Salad className="w-10 h-10 text-gray-300 group-hover:text-orange-500 transition-colors" />
                        <div className="text-center">
                            <p className="font-semibold text-gray-600 group-hover:text-orange-700 transition-colors">
                                Crea nuova dieta
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Definisci un piano alimentare per un utente
                            </p>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
}