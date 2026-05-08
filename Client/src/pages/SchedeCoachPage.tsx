import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getDieteUtente } from '../api/dietaApi';
import type { Dieta } from '../types';
import { Salad, ChevronDown, ChevronUp } from 'lucide-react';

export default function DietaPage() {
    const [diete, setDiete] = useState<Dieta[]>([]);
    const [loading, setLoading] = useState(true);
    const [aperta, setAperta] = useState<number | null>(null);

    useEffect(() => {
        const caricaDiete = async () => {
            try {
                const data = await getDieteUtente();
                setDiete(data);
            } catch (err) {
                console.error('Errore caricamento diete:', err);
            } finally {
                setLoading(false);
            }
        };
        caricaDiete();
    }, []);

    const toggleDieta = (id: number) => {
        setAperta(prev => (prev === id ? null : id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Salad className="w-6 h-6 text-orange-500" />
                    <h1 className="text-2xl font-bold text-gray-800">La mia dieta</h1>
                </div>

                {/* Lista diete */}
                {loading ? (
                    <p className="text-sm text-gray-400">Caricamento...</p>
                ) : diete.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                        <Salad className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Nessuna dieta assegnata.</p>
                        <p className="text-xs mt-1">Il tuo coach deve ancora assegnarti una dieta.</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {diete.map((dieta) => (
                            <li
                                key={dieta.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* Header dieta — cliccabile */}
                                <button
                                    onClick={() => toggleDieta(dieta.id)}
                                    className="w-full flex items-center justify-between px-5 py-4
                                               hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {dieta.titolo}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Coach: {dieta.coach.nome} {dieta.coach.cognome}
                                            {dieta.dataCreazione &&
                                                ` · ${new Date(dieta.dataCreazione).toLocaleDateString('it-IT')}`}
                                        </span>
                                    </div>
                                    {aperta === dieta.id
                                        ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                                        : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                    }
                                </button>

                                {/* Dettaglio dieta espandibile */}
                                {aperta === dieta.id && (
                                    <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">

                                        {/* Descrizione */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Descrizione
                                            </span>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                                {dieta.descrizione}
                                            </p>
                                        </div>

                                        {/* Info coach */}
                                        <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-4 py-3">
                                            <Salad className="w-4 h-4 text-orange-400 shrink-0" />
                                            <p className="text-xs text-orange-700">
                                                Dieta creata da{' '}
                                                <span className="font-semibold">
                                                    {dieta.coach.nome} {dieta.coach.cognome}
                                                </span>
                                                {dieta.dataCreazione && (
                                                    <> il {new Date(dieta.dataCreazione).toLocaleDateString('it-IT', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}</>
                                                )}
                                            </p>
                                        </div>

                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

            </main>
        </div>
    );
}