import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getSchedeUtente, getEserciziScheda } from '../api/allenamentoApi';
import type { SchedaAllenamento, EsercizioScheda } from '../types';
import { ClipboardList, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

export default function SchedePage() {
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [loading, setLoading] = useState(true);

    // Mappa schedaId → lista esercizi (caricati on demand)
    const [eserciziMap, setEserciziMap] = useState<Record<number, EsercizioScheda[]>>({});
    // Mappa schedaId → loading esercizi
    const [loadingEserciziMap, setLoadingEserciziMap] = useState<Record<number, boolean>>({});
    // Quale scheda è espansa
    const [aperta, setAperta] = useState<number | null>(null);

    useEffect(() => {
        const caricaSchede = async () => {
            try {
                const data = await getSchedeUtente();
                setSchede(data);
            } catch (err) {
                console.error('Errore caricamento schede:', err);
            } finally {
                setLoading(false);
            }
        };
        caricaSchede();
    }, []);

    const toggleScheda = async (schedaId: number) => {
        // Se era già aperta, chiudila
        if (aperta === schedaId) {
            setAperta(null);
            return;
        }

        setAperta(schedaId);

        // Carica gli esercizi solo se non li abbiamo già
        if (!eserciziMap[schedaId]) {
            setLoadingEserciziMap(prev => ({ ...prev, [schedaId]: true }));
            try {
                const esercizi = await getEserciziScheda(schedaId);
                setEserciziMap(prev => ({ ...prev, [schedaId]: esercizi }));
            } catch (err) {
                console.error('Errore caricamento esercizi:', err);
            } finally {
                setLoadingEserciziMap(prev => ({ ...prev, [schedaId]: false }));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <ClipboardList className="w-6 h-6 text-green-700" />
                    <h1 className="text-2xl font-bold text-gray-800">Le mie schede</h1>
                </div>

                {/* Lista schede */}
                {loading ? (
                    <p className="text-sm text-gray-400">Caricamento...</p>
                ) : schede.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                        <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Nessuna scheda assegnata.</p>
                        <p className="text-xs mt-1">Il tuo coach deve ancora assegnarti una scheda.</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {schede.map((scheda) => (
                            <li
                                key={scheda.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* Header scheda — cliccabile */}
                                <button
                                    onClick={() => toggleScheda(scheda.id)}
                                    className="w-full flex items-center justify-between px-5 py-4
                                               hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {scheda.titolo}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Coach: {scheda.coach.nome} {scheda.coach.cognome}
                                            {scheda.dataCreazione &&
                                                ` · ${new Date(scheda.dataCreazione).toLocaleDateString('it-IT')}`}
                                        </span>
                                        {scheda.note && (
                                            <span className="text-xs text-gray-500 mt-0.5">{scheda.note}</span>
                                        )}
                                    </div>
                                    {aperta === scheda.id
                                        ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                                        : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                    }
                                </button>

                                {/* Esercizi espandibili */}
                                {aperta === scheda.id && (
                                    <div className="border-t border-gray-100 px-5 py-4">
                                        {loadingEserciziMap[scheda.id] ? (
                                            <p className="text-sm text-gray-400">Caricamento esercizi...</p>
                                        ) : !eserciziMap[scheda.id] || eserciziMap[scheda.id].length === 0 ? (
                                            <p className="text-sm text-gray-400">Nessun esercizio in questa scheda.</p>
                                        ) : (
                                            <ul className="flex flex-col gap-3">
                                                {eserciziMap[scheda.id].map((esercizio) => (
                                                    <li
                                                        key={esercizio.id}
                                                        className="flex items-start gap-3 pb-3
                                                                   border-b border-gray-50 last:border-0 last:pb-0"
                                                    >
                                                        <Dumbbell className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {esercizio.nomeEsercizio}
                                                            </span>
                                                            <div className="flex gap-3 text-xs text-gray-400">
                                                                {esercizio.serie !== null &&
                                                                    <span>{esercizio.serie} serie</span>}
                                                                {esercizio.ripetizioni !== null &&
                                                                    <span>{esercizio.ripetizioni} rip.</span>}
                                                            </div>
                                                            {esercizio.note && (
                                                                <span className="text-xs text-gray-400 italic">
                                                                    {esercizio.note}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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