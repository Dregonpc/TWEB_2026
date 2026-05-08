import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getStoricoBenessere, getCommentiLogBenessere, aggiungiCommentoBenessere  } from '../api/benessereApi';
import type { LogBenessere, CommentoBenessere, Utente } from '../types';
import { ArrowLeft, Heart, MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

export default function MonitoraUtentePsicologoPage() {
    const { utenteId } = useParams<{ utenteId: string }>();
    const navigate = useNavigate();
    const { state } = useLocation();

    const utente = state?.utente as Utente | undefined;

    const [logs, setLogs] = useState<LogBenessere[]>([]);
    const [loading, setLoading] = useState(true);

    const [commentiMap, setCommentiMap] = useState<Record<number, CommentoBenessere[]>>({});
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
                const storico = await getStoricoBenessere(Number(utenteId));
                setLogs(storico);
            } catch (err) {
                console.error('Errore caricamento storico benessere:', err);
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
                const commenti = await getCommentiLogBenessere(logId);
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
            const nuovoCommento = await aggiungiCommentoBenessere ({
                testo: testoCommento,
                data: new Date().toISOString().split('T')[0],
                logBenessere: log,
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
                        className="flex items-center gap-2 text-sm text-purple-600 hover:underline w-fit cursor-pointer"
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

                {/* Torna indietro */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700
                               transition-colors w-fit cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla dashboard
                </button>

                {/* Header utente */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
                    <h1 className="text-xl font-bold text-gray-800">
                        {utente.nome} {utente.cognome}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        @{utente.username} · {utente.email}
                    </p>
                </div>

                {/* Storico benessere */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-700">
                            Storico benessere
                        </h2>
                    </div>

                    {loading ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : logs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                            <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nessun log benessere registrato.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {logs.map((log) => (
                                <li
                                    key={log.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Info log */}
                                    <div className="px-5 py-4 flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {new Date(log.data).toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>

                                        <div className="flex gap-4 text-sm text-gray-600">
                                            {log.livelloUmore  !== null && <span>😊 {log.livelloUmore}/10</span>}
                                            {log.livelloSonno  !== null && <span>😴 {log.livelloSonno}/10</span>}
                                            {log.livelloStress !== null && <span>😰 {log.livelloStress}/10</span>}
                                        </div>

                                        {log.noteDiario && (
                                            <p className="text-sm text-gray-500 italic">"{log.noteDiario}"</p>
                                        )}

                                        {/* Azioni */}
                                        <div className="flex items-center gap-4 mt-1">
                                            <button
                                                onClick={() => toggleCommenti(log.id)}
                                                className="flex items-center gap-1.5 text-xs text-purple-500
                                                           hover:text-purple-700 transition-colors cursor-pointer"
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
                                                className="flex items-center gap-1.5 text-xs text-purple-400
                                                           hover:text-purple-600 transition-colors cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                {formCommentoAperto === log.id ? 'Annulla' : 'Aggiungi commento'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sezione commenti */}
                                    {commentiAperti === log.id && (
                                        <div className="border-t border-gray-100 bg-purple-50 px-5 py-4 flex flex-col gap-3">

                                            {loadingCommentiMap[log.id] ? (
                                                <p className="text-xs text-gray-400">Caricamento...</p>
                                            ) : !commentiMap[log.id] || commentiMap[log.id].length === 0 ? (
                                                <p className="text-xs text-gray-400">Nessun commento.</p>
                                            ) : (
                                                <ul className="flex flex-col gap-3">
                                                    {commentiMap[log.id].map((commento) => (
                                                        <li key={commento.id} className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-semibold text-purple-700">
                                                                {commento.psicologo.nome} {commento.psicologo.cognome}
                                                                <span className="font-normal text-gray-400 ml-2">
                                                                    {new Date(commento.data).toLocaleDateString('it-IT')}
                                                                </span>
                                                            </span>
                                                            <p className="text-sm text-gray-700">{commento.testo}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Form nuovo commento */}
                                            {formCommentoAperto === log.id && (
                                                <form
                                                    onSubmit={(e) => handleInviaCommento(e, log.id)}
                                                    className="flex flex-col gap-2 pt-2 border-t border-purple-100"
                                                >
                                                    <textarea
                                                        value={testoCommento}
                                                        onChange={(e) => setTestoCommento(e.target.value)}
                                                        placeholder="Scrivi un commento per questo log..."
                                                        rows={2}
                                                        required
                                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                                                   resize-none focus:outline-none focus:border-purple-600
                                                                   focus:ring-1 focus:ring-purple-600 transition-colors bg-white"
                                                    />
                                                    {erroreCommento && (
                                                        <p className="text-xs text-red-600">{erroreCommento}</p>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        disabled={salvataggioCommento}
                                                        className="self-end flex items-center gap-2 text-sm bg-purple-600
                                                                   hover:bg-purple-700 disabled:opacity-50 text-white
                                                                   font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        {salvataggioCommento ? 'Invio...' : 'Invia'}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
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