import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getListaUtenti } from '../../api/utenteApi';
import { getStoricoBenessere } from '../../api/benessereApi';
import type { Utente } from '../../types';
import { Users, Activity, ChevronRight } from 'lucide-react';
import StatCard from '../../components/StatCard';

export default function DashboardPsicologo() {
    const { utente } = useAuth();
    const navigate = useNavigate();

    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [totaleLogs, setTotaleLogs] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const caricaDati = async () => {
            try {
                const listaUtenti = await getListaUtenti();
                setUtenti(listaUtenti);
                if (listaUtenti.length > 0) {
                    const logs = await getStoricoBenessere(listaUtenti[0].id);
                    setTotaleLogs(logs.length);
                }
            } catch (err) {
                console.error('Errore caricamento dashboard psicologo:', err);
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

            <main className="max-w-5xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {saluto}, {utente?.nome}! 👋
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 capitalize">{oggi}</p>
                    </div>
                    <span className="text-xs font-bold bg-purple-100 text-purple-700
                                     px-3 py-1 rounded-full uppercase tracking-wide mt-1">
                        Psicologo
                    </span>
                </div>

                {/* Grid statistiche */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                        title="Pazienti seguiti"
                        value={utenti.length}
                        icon={Users}
                        color="purple"
                    />

                    <StatCard
                        title="Log benessere"
                        value={totaleLogs}
                        icon={Activity}
                        color="emerald"
                        subtitle={
                            utenti.length > 0
                                ? `di ${utenti[0].nome} ${utenti[0].cognome}`
                                : '—'
                        }
                    />
                </div>

                {/* Sezione pazienti */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-500" />
                            <h2 className="font-semibold text-slate-700">I miei pazienti</h2>
                        </div>
                        <button
                            onClick={() => navigate('/psicologo/utenti')}
                            className="text-sm text-purple-600 hover:text-purple-800
                                       transition-colors cursor-pointer flex items-center gap-1"
                        >
                            Vedi tutti <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-sm text-slate-400">Caricamento...</p>
                    ) : utenti.length === 0 ? (
                        <p className="text-sm text-slate-400">Nessun paziente assegnato.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {utenti.slice(0, 6).map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => navigate(`/psicologo/utente/${u.id}`, { state: { utente: u } })}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-100
                                               hover:border-purple-200 hover:bg-purple-50/50
                                               transition-all text-left cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center
                                                    justify-center text-purple-700 font-bold text-sm shrink-0">
                                        {u.nome.charAt(0)}{u.cognome.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-700 truncate">
                                            {u.nome} {u.cognome}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate">@{u.username}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}