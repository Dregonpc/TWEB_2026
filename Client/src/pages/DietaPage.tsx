import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import DietaCard from '../components/DietaCard';
import { getDieteUtente } from '../api/dietaApi';
import type { Dieta } from '../types';
import { Salad } from 'lucide-react';

export default function DietaPage() {
    const [diete, setDiete] = useState<Dieta[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Salad className="w-6 h-6 text-orange-500" />

                    <h1 className="text-2xl font-bold text-gray-800">
                        La mia dieta
                    </h1>
                </div>

                {/* Loading */}
                {loading ? (
                    <p className="text-sm text-gray-400">
                        Caricamento...
                    </p>
                ) : diete.length === 0 ? (

                    /* Empty state */
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                        <Salad className="w-10 h-10 mx-auto mb-3 opacity-30" />

                        <p className="text-sm">
                            Nessuna dieta assegnata.
                        </p>

                        <p className="text-xs mt-1">
                            Il tuo coach deve ancora assegnarti una dieta.
                        </p>
                    </div>

                ) : (

                    /* Lista diete */
                    <div className="flex flex-col gap-3">
                        {diete.map((dieta) => (
                            <DietaCard
                                key={dieta.id}
                                dieta={dieta}
                                variant="utente"
                            />
                        ))}
                    </div>

                )}

            </main>
        </div>
    );
}