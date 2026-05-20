import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CommentoAllenamentoComponent from '../components/CommentoAllenamentoComponent';
import { getUltimi7, getCommentiLog, aggiungiCommento } from '../api/allenamentoApi';
import type { LogAllenamento, CommentoAllenamento, Utente } from '../types';
import { ArrowLeft, Dumbbell, MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

export default function MonitoraUtenteCoachPage() {
    const { utenteId } = useParams<{ utenteId: string }>();
    const navigate = useNavigate();
    const { state } = useLocation();

    const utente = state?.utente as Utente | undefined;

    const [logs, setLogs] = useState<LogAllenamento[]>([]);
    const [loading, setLoading] = useState(true);

    const [commentiMap, setCommentiMap] = useState<Record<number, CommentoAllenamento[]>>({});
    const [loadingCommentiMap, setLoadingCommentiMap] = useState<Record<number, boolean>>({});
    const [commentiAperti, setCommentiAperti] = useState<number | null>(null);

    const [formCommentoAperto, setFormCommentoAperto] = useState<number | null>(null);
    const [testoCommento, setTestoCommento] = useState('');
    const [salvataggioCommento, setSalvataggioCommento] = useState(false);
    const [erroreCommento, setErroreCommento] = useState<string | null>(null);

    useEffect(() => {
        if (!utenteId) return;
        const caricaLogs = async () => {
            try {
                const ultimi7 = await getUltimi7(Number(utenteId));
                setLogs(ultimi7);
            } catch (err) {
                console.error('Errore caricamento allenamenti:', err);
            } finally {
                setLoading(false);
            }
        };
        caricaLogs();
    }, [utenteId]);

    const toggleCommenti = async (logId: number) => {
        if (commentiAperti === logId) {
            setCommentiAperti(null);
            return;
        }

        setCommentiAperti(logId);

        if (!commentiMap[logId]) {
            setLoadingCommentiMap(prev => ({ ...prev, [logId]: true }));
            try {
                const commenti = await getCommentiLog(logId);
                setCommentiMap(prev => ({ ...prev, [logId]: commenti }));
            } catch (err) {
                console.error('Errore caricamento commenti:', err);
            } finally {
                setLoadingCommentiMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

    const handleInviaCommento = async (e: React.FormEvent, logId: number) => {
        e.preventDefault();
        if (!testoCommento.trim()) return;

        setErroreCommento(null);
        setSalvataggioCommento(true);

        try {
            const log = logs.find(l => l.id === logId)!;
            const nuovoCommento = await aggiungiCommento({
                testo: testoCommento,
                data: new Date().toISOString().split('T')[0],
                logAllenamento: log,
            });

            setCommentiMap(prev => ({
                ...prev,
                [logId]: [...(prev[logId] ?? []), nuovoCommento],
            }));

            setTestoCommento('');
            setFormCommentoAperto(null);
        } catch {
            setErroreCommento("Errore durante l'invio. Riprova.");
        } finally {
            setSalvataggioCommento(false);
        }
    };

    if (!utente) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-4">
                    <p className="text-sm text-gray-500">Utente non trovato.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-green-700 hover:underline w-fit cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna alla dashboard
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
                    <h1 className="text-xl font-bold text-gray-800">
                        {utente.nome} {utente.cognome}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        @{utente.username} · {utente.email}
                    </p>
                </div>

                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-green-700" />
                        <h2 className="text-lg font-semibold text-gray-700">
                            Allenamenti ultimi 7 giorni
                        </h2>
                    </div>

                    {loading ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : logs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nessun allenamento negli ultimi 7 giorni.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {logs.map((log) => (
                                <li
                                    key={log.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <div className="px-5 py-4 flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {new Date(log.data).toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>

                                        {log.note ? (
                                            <p className="text-sm text-gray-500">{log.note}</p>
                                        ) : (
                                            <p className="text-xs text-gray-300 italic">Nessuna nota</p>
                                        )}

                                        <div className="flex items-center gap-4 mt-1">
                                            <button
                                                onClick={() => toggleCommenti(log.id)}
                                                className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                Commenti
                                                {commentiAperti === log.id
                                                    ? <ChevronUp className="w-3 h-3" />
                                                    : <ChevronDown className="w-3 h-3" />
                                                }
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setFormCommentoAperto(prev => prev === log.id ? null : log.id);
                                                    setTestoCommento('');
                                                    setErroreCommento(null);
                                                    if (commentiAperti !== log.id) toggleCommenti(log.id);
                                                }}
                                                className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 transition-colors cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                {formCommentoAperto === log.id ? 'Annulla' : 'Aggiungi commento'}
                                            </button>
                                        </div>
                                    </div>

                                    {commentiAperti === log.id && (
                                        <>
                                            <CommentoAllenamentoComponent
                                                commenti={commentiMap[log.id] ?? []}
                                                loading={loadingCommentiMap[log.id] ?? false}
                                            />

                                            {formCommentoAperto === log.id && (
                                                <div className="px-5 py-4 border-t border-green-100 bg-white">
                                                    <form
                                                        onSubmit={(e) => handleInviaCommento(e, log.id)}
                                                        className="flex flex-col gap-2"
                                                    >
                                                        <textarea
                                                            value={testoCommento}
                                                            onChange={(e) => setTestoCommento(e.target.value)}
                                                            placeholder="Scrivi un commento per questo allenamento..."
                                                            rows={2}
                                                            required
                                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition-colors bg-white"
                                                        />
                                                        {erroreCommento && (
                                                            <p className="text-xs text-red-600">{erroreCommento}</p>
                                                        )}
                                                        <button
                                                            type="submit"
                                                            disabled={salvataggioCommento}
                                                            className="self-end flex items-center gap-2 text-sm bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                            {salvataggioCommento ? 'Invio...' : 'Invia'}
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}