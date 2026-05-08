import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getListaUtenti } from '../../api/utenteApi';
import { getSchedeCoach } from '../../api/allenamentoApi';
import type { Utente, SchedaAllenamento } from '../../types';
import { Users, ClipboardList, ChevronRight } from 'lucide-react';

export default function DashboardCoach() {
    const { utente } = useAuth();
    const navigate = useNavigate();

    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const caricaDati = async () => {
            try {
                const [listaUtenti, listaSchede] = await Promise.all([
                    getListaUtenti(),
                    getSchedeCoach(),
                ]);
                setUtenti(listaUtenti);
                setSchede(listaSchede);
            } catch (err) {
                console.error('Errore caricamento dashboard coach:', err);
            } finally {
                setLoading(false);
            }
        };
        caricaDati();
    }, []);

    if (loading) return <p className="text-gray-500 text-sm">Caricamento...</p>;

    return (
        <div className="flex flex-col gap-8">

            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Ciao, Coach {utente?.nome}!
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Monitora i tuoi utenti e gestisci le schede.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Lista utenti */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <Users className="w-5 h-5" />
                            <span>I miei utenti</span>
                        </div>
                        <span className="text-xs text-gray-400">{utenti.length} totali</span>
                    </div>

                    {utenti.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessun utente assegnato.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {utenti.map((u) => (
                                <li key={u.id}>
                                    <button
                                        onClick={() => navigate(
                                            `/coach/utente/${u.id}`,
                                            { state: { utente: u } }  // ← passa l'utente nello state
                                        )}
                                        className="w-full flex items-center justify-between px-3 py-2
                                                   rounded-lg hover:bg-green-50 transition-colors text-left cursor-pointer"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">
                                                {u.nome} {u.cognome}
                                            </span>
                                            <span className="text-xs text-gray-400">@{u.username}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Schede create */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-500 font-semibold">
                            <ClipboardList className="w-5 h-5" />
                            <span>Schede create</span>
                        </div>
                        <button
                            onClick={() => navigate('/coach/schede')}
                            className="text-xs text-orange-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                            Gestisci <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {schede.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessuna scheda creata.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {schede.slice(0, 5).map((scheda) => (
                                <li
                                    key={scheda.id}
                                    className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        {scheda.titolo}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Per: {scheda.utente.nome} {scheda.utente.cognome}
                                        {scheda.dataCreazione &&
                                            ` · ${new Date(scheda.dataCreazione).toLocaleDateString('it-IT')}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button
                        onClick={() => navigate('/coach/schede')}
                        className="mt-auto text-center text-sm bg-orange-500 hover:bg-orange-600
                                   text-white font-semibold rounded-lg py-2 transition-colors cursor-pointer"
                    >
                        + Crea nuova scheda
                    </button>
                </section>

            </div>
        </div>
    );
}