import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStorico, getSchedeUtente } from '../../api/allenamentoApi';
import { getStoricoBenessere } from '../../api/benessereApi';
import { getDieteUtente } from '../../api/dietaApi';
import type {
    LogAllenamento,
    LogBenessere,
    Dieta,
    SchedaAllenamento
} from '../../types';
import {Dumbbell, Heart, Salad, ChevronRight, Smile, Moon, ClipboardList} from 'lucide-react';
import StatCard from '../../components/StatCard';

export default function DashboardUser() {

    const { utente } = useAuth();

    const [allenamenti, setAllenamenti] = useState<LogAllenamento[]>([]);
    const [benessere, setBenessere] = useState<LogBenessere[]>([]);
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [diete, setDiete] = useState<Dieta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const caricaDati = async () => {
            try {
                const [
                    listaAllenamenti,
                    listaBenessere,
                    listaSchede,
                    listaDiete
                ] = await Promise.all([
                    getStorico(),
                    getStoricoBenessere(utente!.id),
                    getSchedeUtente(),
                    getDieteUtente(),
                ]);

                setAllenamenti(listaAllenamenti);
                setBenessere(listaBenessere);
                setSchede(listaSchede);
                setDiete(listaDiete);
            } catch (err) {
                console.error('Errore caricamento dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        caricaDati();
    }, []);

    const mediaUmore =
        benessere.length > 0
            ? (
                benessere.reduce(
                    (acc, curr) => acc + (curr.livelloUmore || 0),
                    0
                ) / benessere.length
            ).toFixed(1)
            : '-';

    const mediaSonno =
        benessere.length > 0
            ? (
                benessere.reduce(
                    (acc, curr) => acc + (curr.livelloSonno || 0),
                    0
                ) / benessere.length
            ).toFixed(1)
            : '-';

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className="bg-white rounded-xl h-28 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Ciao, {utente?.nome}! 👋
                </h1>

                <p className="text-gray-500 text-sm mt-1">
                    Ecco il riepilogo della tua attività recente.
                </p>
            </div>

            {/* Statistiche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <StatCard
                    title="Allenamenti totali"
                    value={allenamenti.length}
                    icon={Dumbbell}
                    color="green"
                />

                <StatCard
                    title="Log benessere"
                    value={benessere.length}
                    icon={Heart}
                    color="purple"
                />

                <StatCard
                    title="Media umore"
                    value={mediaUmore}
                    icon={Smile}
                    color="orange"
                    subtitle="scala 1-10"
                />

                <StatCard
                    title="Media sonno"
                    value={mediaSonno}
                    icon={Moon}
                    color="blue"
                    subtitle="scala 1-10"
                />

            </div>

            {/* Card principali */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Allenamenti */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <Dumbbell className="w-5 h-5" />
                            <span>Allenamenti</span>
                        </div>

                        <Link
                            to="/allenamento"
                            className="text-xs text-green-600 hover:underline flex items-center gap-0.5"
                        >
                            Vedi tutti
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {allenamenti.length === 0 ? (

                        <p className="text-sm text-gray-400">
                            Nessun allenamento registrato.
                        </p>

                    ) : (

                        <ul className="flex flex-col gap-3">

                            {allenamenti.slice(0, 3).map((log) => (

                                <li
                                    key={log.id}
                                    className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        Allenamento del{' '}
                                        {new Date(log.data).toLocaleDateString('it-IT')}
                                    </span>

                                    {log.note && (
                                        <span className="text-xs text-gray-400 line-clamp-1">
                                            {log.note}
                                        </span>
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

                        <Link
                            to="/benessere"
                            className="text-xs text-purple-500 hover:underline flex items-center gap-0.5"
                        >
                            Vedi tutti
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {benessere.length === 0 ? (

                        <p className="text-sm text-gray-400">
                            Nessun log benessere registrato.
                        </p>

                    ) : (

                        <ul className="flex flex-col gap-3">

                            {benessere.slice(0, 3).map((log) => (

                                <li
                                    key={log.id}
                                    className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0"
                                >
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.data).toLocaleDateString('it-IT')}
                                    </span>

                                    <div className="flex gap-3 text-sm text-gray-700">
                                        {log.livelloUmore !== null && (
                                            <span>😊 {log.livelloUmore}/10</span>
                                        )}

                                        {log.livelloSonno !== null && (
                                            <span>😴 {log.livelloSonno}/10</span>
                                        )}

                                        {log.livelloStress !== null && (
                                            <span>😰 {log.livelloStress}/10</span>
                                        )}
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

                {/* Schede */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 min-h-[320px]">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                            <ClipboardList className="w-5 h-5" />
                            <span>Schede</span>
                        </div>

                        <Link
                            to="/schede"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
                        >
                            Vedi tutte
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {schede.length === 0 ? (

                        <p className="text-sm text-gray-400">
                            Nessuna scheda assegnata dal coach.
                        </p>

                    ) : (

                        <ul className="flex flex-col gap-3">

                            {schede.slice(0, 3).map((scheda) => (

                                <li
                                    key={scheda.id}
                                    className="flex flex-col gap-1 border-b border-gray-50 pb-3 last:border-0"
                                >

                                    {/* Titolo */}
                                    <span className="text-sm font-semibold text-gray-800">
                                        {scheda.titolo}
                                    </span>

                                    {/* Coach */}
                                    {scheda.coach && (
                                        <span className="text-xs text-blue-500 font-medium">
                                            Coach: {scheda.coach.nome}
                                        </span>
                                    )}

                                    {/* Descrizione */}
                                    {scheda.note && (
                                        <span className="text-xs text-gray-400 line-clamp-2">
                                            {scheda.note}
                                        </span>
                                    )}

                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        to="/schede"
                        className="mt-auto text-center text-sm bg-blue-600 hover:bg-blue-700
                                   text-white font-semibold rounded-lg py-2 transition-colors"
                    >
                        Vedi schede
                    </Link>

                </section>

                {/* Dieta */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 text-orange-500 font-semibold">
                            <Salad className="w-5 h-5" />
                            <span>Dieta</span>
                        </div>

                        <Link
                            to="/dieta"
                            className="text-xs text-orange-400 hover:underline flex items-center gap-0.5"
                        >
                            Vedi tutte
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {diete.length === 0 ? (

                        <p className="text-sm text-gray-400">
                            Nessuna dieta assegnata dal coach.
                        </p>

                    ) : (

                        <ul className="flex flex-col gap-3">

                            {diete.slice(0, 3).map((dieta) => (

                                <li
                                    key={dieta.id}
                                    className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 last:border-0"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        {dieta.titolo}
                                    </span>

                                    <span className="text-xs text-gray-400 line-clamp-2">
                                        {dieta.descrizione}
                                    </span>
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