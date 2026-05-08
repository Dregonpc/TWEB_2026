import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getListaUtenti } from '../../api/utenteApi';
import { getStoricoBenessere } from '../../api/benessereApi';
import type { Utente, LogBenessere } from '../../types';
import { Users, Heart } from 'lucide-react';

export default function DashboardPsicologo() {
    const { utente } = useAuth();
    const navigate = useNavigate();

    const [utenti, setUtenti] = useState<Utente[]>([]);
    // Ultimi log benessere del primo utente come anteprima
    const [ultimi3Benessere, setUltimi3Benessere] = useState<LogBenessere[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const caricaDati = async () => {
            try {
                const listaUtenti = await getListaUtenti();
                setUtenti(listaUtenti);

                // Carica i log benessere del primo utente come anteprima nella dashboard
                if (listaUtenti.length > 0) {
                    const benessere = await getStoricoBenessere(listaUtenti[0].id);
                    setUltimi3Benessere(benessere.slice(0, 3));
                }
            } catch (err) {
                console.error('Errore caricamento dashboard psicologo:', err);
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
                <h1 className="text-2xl font-bold text-gray-800">Ciao, {utente?.nome}!</h1>
                <p className="text-gray-500 text-sm mt-1">Monitora il benessere dei tuoi utenti.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Lista utenti */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-600 font-semibold">
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
                                        onClick={() => navigate(`/psicologo/utente/${u.id}`)}
                                        className="w-full flex items-center justify-between px-3 py-2
                                                   rounded-lg hover:bg-purple-50 transition-colors text-left"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">
                                                {u.nome} {u.cognome}
                                            </span>
                                            <span className="text-xs text-gray-400">@{u.username}</span>
                                        </div>
                                        <Heart className="w-4 h-4 text-purple-300" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Anteprima log benessere primo utente */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                        <Heart className="w-5 h-5" />
                        <span>
                            {utenti.length > 0
                                ? `Ultimi log — ${utenti[0].nome} ${utenti[0].cognome}`
                                : 'Log benessere'}
                        </span>
                    </div>

                    {ultimi3Benessere.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessun log disponibile.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {ultimi3Benessere.map((log) => (
                                <li key={log.id} className="flex flex-col gap-1 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.data).toLocaleDateString('it-IT')}
                                    </span>
                                    <div className="flex gap-3 text-sm text-gray-700">
                                        {log.livelloUmore  !== null && <span>😊 {log.livelloUmore}/10</span>}
                                        {log.livelloSonno  !== null && <span>😴 {log.livelloSonno}/10</span>}
                                        {log.livelloStress !== null && <span>😰 {log.livelloStress}/10</span>}
                                    </div>
                                    {log.noteDiario && (
                                        <span className="text-xs text-gray-500 italic line-clamp-2">
                                            "{log.noteDiario}"
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {utenti.length > 0 && (
                        <button
                            onClick={() => navigate(`/psicologo/utente/${utenti[0].id}`)}
                            className="mt-auto text-center text-sm bg-purple-600 hover:bg-purple-700
                                       text-white font-semibold rounded-lg py-2 transition-colors cursor-pointer"
                        >
                            Vai al profilo completo
                        </button>
                    )}
                </section>

            </div>
        </div>
    );
}