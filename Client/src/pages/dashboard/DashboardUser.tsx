import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStorico } from '../../api/allenamentoApi';
import { getStoricoBenessere } from '../../api/benessereApi';
import { getDieteUtente } from '../../api/dietaApi';
import type { LogAllenamento, LogBenessere, Dieta } from '../../types';
import { Dumbbell, Heart, Salad, ChevronRight } from 'lucide-react';

export default function DashboardUser() {
    const { utente } = useAuth();

    const [ultimi3Allenamenti, setUltimi3Allenamenti] = useState<LogAllenamento[]>([]);
    const [ultimi3Benessere, setUltimi3Benessere] = useState<LogBenessere[]>([]);
    const [diete, setDiete] = useState<Dieta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const caricaDati = async () => {
            try {
                const [allenamenti, benessere, dieteUtente] = await Promise.all([
                    getStorico(),
                    getStoricoBenessere(utente!.id),
                    getDieteUtente(),
                ]);
                setUltimi3Allenamenti(allenamenti.slice(0, 3));
                setUltimi3Benessere(benessere.slice(0, 3));
                setDiete(dieteUtente.slice(0, 3));
            } catch (err) {
                console.error('Errore caricamento dashboard:', err);
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
                <p className="text-gray-500 text-sm mt-1">Ecco il riepilogo della tua attività recente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Allenamenti */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <Dumbbell className="w-5 h-5" />
                            <span>Allenamenti</span>
                        </div>
                        <Link to="/allenamento" className="text-xs text-green-600 hover:underline flex items-center gap-0.5">
                            Vedi tutti <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {ultimi3Allenamenti.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessun allenamento registrato.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {ultimi3Allenamenti.map((log) => (
                                <li key={log.id} className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-sm font-medium text-gray-700">
                                        {/* LogAllenamento non ha tipoAllenamento, usiamo la data come titolo */}
                                        Allenamento del {new Date(log.data).toLocaleDateString('it-IT')}
                                    </span>
                                    {log.note && (
                                        <span className="text-xs text-gray-400 line-clamp-1">{log.note}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        to="/allenamento"
                        className="mt-auto text-center text-sm bg-green-700 hover:bg-green-800
                                   text-white font-semibold rounded-lg py-2 transition-colors"
                    >
                        + Registra allenamento
                    </Link>
                </section>

                {/* Benessere */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-600 font-semibold">
                            <Heart className="w-5 h-5" />
                            <span>Benessere</span>
                        </div>
                        <Link to="/benessere" className="text-xs text-purple-500 hover:underline flex items-center gap-0.5">
                            Vedi tutti <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {ultimi3Benessere.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessun log benessere registrato.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {ultimi3Benessere.map((log) => (
                                <li key={log.id} className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.data).toLocaleDateString('it-IT')}
                                    </span>
                                    <div className="flex gap-3 text-sm text-gray-700">
                                        {log.livelloUmore   !== null && <span>😊 {log.livelloUmore}/10</span>}
                                        {log.livelloSonno   !== null && <span>😴 {log.livelloSonno}/10</span>}
                                        {log.livelloStress  !== null && <span>😰 {log.livelloStress}/10</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        to="/benessere"
                        className="mt-auto text-center text-sm bg-purple-600 hover:bg-purple-700
                                   text-white font-semibold rounded-lg py-2 transition-colors"
                    >
                        + Registra benessere
                    </Link>
                </section>

                {/* Dieta */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-500 font-semibold">
                            <Salad className="w-5 h-5" />
                            <span>Dieta</span>
                        </div>
                        <Link to="/dieta" className="text-xs text-orange-400 hover:underline flex items-center gap-0.5">
                            Vedi tutte <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {diete.length === 0 ? (
                        <p className="text-sm text-gray-400">Nessuna dieta assegnata dal coach.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {diete.map((dieta) => (
                                <li key={dieta.id} className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-sm font-medium text-gray-700">{dieta.titolo}</span>
                                    <span className="text-xs text-gray-400 line-clamp-2">{dieta.descrizione}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        to="/dieta"
                        className="mt-auto text-center text-sm bg-orange-500 hover:bg-orange-600
                                   text-white font-semibold rounded-lg py-2 transition-colors"
                    >
                        Vedi dieta completa
                    </Link>
                </section>

            </div>
        </div>
    );
}