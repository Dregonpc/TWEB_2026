import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CommentoAllenamentoComponent from '../components/CommentoAllenamentoComponent';
import {
    getUltimi7,
    getStoricoCoachUtente,
    getCommentiLog,
    aggiungiCommento,
    eliminaCommento,
    getEserciziLog,
    getSchedeCoach,
    getEserciziScheda,
    eliminaScheda,
} from '../api/allenamentoApi';
import { getDieteCoach, eliminaDieta } from '../api/dietaApi';
import type {
    LogAllenamento,
    CommentoAllenamento,
    Utente,
    EsercizioSvolto,
    SchedaAllenamento,
    EsercizioScheda,
    Dieta,
} from '../types';
import {ArrowLeft, Dumbbell, MessageCircle, ChevronDown, ChevronUp, Send, ClipboardList, FileText, Apple, Trash2, AlertTriangle,} from 'lucide-react';

// ── Sezione collassabile ──────────────────────────────────────────────────────

function Sezione({
    icon,
    titolo,
    colore,
    defaultAperta = true,
    children,
}: {
    icon: React.ReactNode;
    titolo: string;
    colore: string;
    defaultAperta?: boolean;
    children: React.ReactNode;
}) {
    const [aperta, setAperta] = useState(defaultAperta);

    return (
        <section className="flex flex-col gap-3">
            <button
                onClick={() => setAperta(prev => !prev)}
                className="flex items-center justify-between gap-2 w-full py-1 text-left"
            >
                <div className={`flex items-center gap-2 ${colore}`}>
                    {icon}
                    <h2 className="text-lg font-semibold text-gray-700">{titolo}</h2>
                </div>
                {aperta
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                }
            </button>

            {aperta && children}
        </section>
    );
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function MonitoraUtenteCoachPage() {
    const { utenteId } = useParams<{ utenteId: string }>();
    const navigate = useNavigate();
    const { state } = useLocation();

    const utente = state?.utente as Utente | undefined;
    const utenteIdNum = Number(utenteId);

    const [ultimiLogs, setUltimiLogs] = useState<LogAllenamento[]>([]);
    const [storicoCompleto, setStoricoCompleto] = useState<LogAllenamento[]>([]);
    const [schedeCoach, setSchedeCoach] = useState<SchedaAllenamento[]>([]);
    const [dieteCoach, setDieteCoachState] = useState<Dieta[]>([]);

    const [loadingUltimi, setLoadingUltimi] = useState(true);
    const [loadingStorico, setLoadingStorico] = useState(true);
    const [loadingSchede, setLoadingSchede] = useState(true);
    const [loadingDiete, setLoadingDiete] = useState(true);

    // Commenti
    const [commentiMap, setCommentiMap] = useState<Record<number, CommentoAllenamento[]>>({});
    const [loadingCommentiMap, setLoadingCommentiMap] = useState<Record<number, boolean>>({});
    const [commentiAperti, setCommentiAperti] = useState<number | null>(null);

    // Esercizi log
    const [eserciziLogMap, setEserciziLogMap] = useState<Record<number, EsercizioSvolto[]>>({});
    const [loadingEserciziLogMap, setLoadingEserciziLogMap] = useState<Record<number, boolean>>({});
    const [eserciziLogAperti, setEserciziLogAperti] = useState<number | null>(null);

    // Esercizi scheda
    const [eserciziSchedaMap, setEserciziSchedaMap] = useState<Record<number, EsercizioScheda[]>>({});
    const [loadingEserciziSchedaMap, setLoadingEserciziSchedaMap] = useState<Record<number, boolean>>({});
    const [schedaAperta, setSchedaAperta] = useState<number | null>(null);

    // Form commento
    const [formCommentoAperto, setFormCommentoAperto] = useState<number | null>(null);
    const [testoCommento, setTestoCommento] = useState('');
    const [salvataggioCommento, setSalvataggioCommento] = useState(false);
    const [erroreCommento, setErroreCommento] = useState<string | null>(null);

    // Elimina scheda
    const [confermaEliminaSchedaId, setConfermaEliminaSchedaId] = useState<number | null>(null);
    const [eliminandoSchedaId, setEliminandoSchedaId] = useState<number | null>(null);
    const [erroreEliminaScheda, setErroreEliminaScheda] = useState<string | null>(null);

    // Elimina dieta
    const [confermaEliminaDietaId, setConfermaEliminaDietaId] = useState<number | null>(null);
    const [eliminandoDietaId, setEliminandoDietaId] = useState<number | null>(null);
    const [erroreEliminaDieta, setErroreEliminaDieta] = useState<string | null>(null);

    useEffect(() => {
        if (!utenteIdNum) return;

        Promise.all([
            getUltimi7(utenteIdNum),
            getStoricoCoachUtente(utenteIdNum),
            getSchedeCoach(),
            getDieteCoach(),
        ])
            .then(([ultimi7Data, storicoData, schedeData, dieteData]) => {
                setUltimiLogs(ultimi7Data as LogAllenamento[]);
                setStoricoCompleto(storicoData as LogAllenamento[]);
                setSchedeCoach(schedeData as SchedaAllenamento[]);
                setDieteCoachState(dieteData as Dieta[]);
            })
            .catch((err) => {
                console.error('Errore caricamento dati utente monitorato:', err);
            })
            .finally(() => {
                setLoadingUltimi(false);
                setLoadingStorico(false);
                setLoadingSchede(false);
                setLoadingDiete(false);
            });
    }, [utenteIdNum]);

    const schedeUtente = useMemo(() => {
        return schedeCoach.filter((scheda: any) => {
            const id = scheda?.utente?.id ?? scheda?.atleta?.id ?? scheda?.utenteId ?? null;
            return id === utenteIdNum;
        });
    }, [schedeCoach, utenteIdNum]);

    const dieteUtente = useMemo(() => {
        return dieteCoach.filter((dieta: any) => {
            const id = dieta?.utente?.id ?? dieta?.atleta?.id ?? dieta?.utenteId ?? null;
            return id === utenteIdNum;
        });
    }, [dieteCoach, utenteIdNum]);

    // ── Toggle handlers ───────────────────────────────────────────────────────

    const toggleCommenti = async (logId: number) => {
        if (commentiAperti === logId) { setCommentiAperti(null); return; }
        setCommentiAperti(logId);
        if (!commentiMap[logId]) {
            setLoadingCommentiMap(prev => ({ ...prev, [logId]: true }));
            try {
                const commenti = await getCommentiLog(logId);
                setCommentiMap(prev => ({ ...prev, [logId]: commenti as CommentoAllenamento[] }));
            } catch (err) {
                console.error('Errore caricamento commenti:', err);
            } finally {
                setLoadingCommentiMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

    const toggleEserciziLog = async (logId: number) => {
        if (eserciziLogAperti === logId) { setEserciziLogAperti(null); return; }
        setEserciziLogAperti(logId);
        if (!eserciziLogMap[logId]) {
            setLoadingEserciziLogMap(prev => ({ ...prev, [logId]: true }));
            try {
                const esercizi = await getEserciziLog(logId);
                setEserciziLogMap(prev => ({ ...prev, [logId]: esercizi as EsercizioSvolto[] }));
            } catch (err) {
                console.error('Errore caricamento esercizi log:', err);
            } finally {
                setLoadingEserciziLogMap(prev => ({ ...prev, [logId]: false }));
            }
        }
    };

    const toggleEserciziScheda = async (schedaId: number) => {
        if (schedaAperta === schedaId) { setSchedaAperta(null); return; }
        setSchedaAperta(schedaId);
        if (!eserciziSchedaMap[schedaId]) {
            setLoadingEserciziSchedaMap(prev => ({ ...prev, [schedaId]: true }));
            try {
                const esercizi = await getEserciziScheda(schedaId);
                setEserciziSchedaMap(prev => ({ ...prev, [schedaId]: esercizi as EsercizioScheda[] }));
            } catch (err) {
                console.error('Errore caricamento esercizi scheda:', err);
            } finally {
                setLoadingEserciziSchedaMap(prev => ({ ...prev, [schedaId]: false }));
            }
        }
    };

    // ── Commenti ──────────────────────────────────────────────────────────────

    const handleInviaCommento = async (e: React.FormEvent, logId: number) => {
        e.preventDefault();
        if (!testoCommento.trim()) return;
        setErroreCommento(null);
        setSalvataggioCommento(true);
        try {
            const log =
                storicoCompleto.find(l => l.id === logId) ??
                ultimiLogs.find(l => l.id === logId);
            if (!log) return;
            const nuovoCommento = await aggiungiCommento({
                testo: testoCommento,
                data: new Date().toISOString().split('T')[0],
                logAllenamento: log,
            });
            setCommentiMap(prev => ({
                ...prev,
                [logId]: [...(prev[logId] ?? []), nuovoCommento as CommentoAllenamento],
            }));
            setTestoCommento('');
            setFormCommentoAperto(null);
        } catch {
            setErroreCommento("Errore durante l'invio. Riprova.");
        } finally {
            setSalvataggioCommento(false);
        }
    };

    const handleEliminaCommento = async (logId: number, commentoId: number) => {
        await eliminaCommento(commentoId);
        setCommentiMap(prev => ({
            ...prev,
            [logId]: (prev[logId] ?? []).filter(c => c.id !== commentoId),
        }));
    };

    // ── Elimina scheda ────────────────────────────────────────────────────────

    const handleEliminaScheda = async (schedaId: number) => {
        setErroreEliminaScheda(null);
        setEliminandoSchedaId(schedaId);
        try {
            await eliminaScheda(schedaId);
            setSchedeCoach(prev => prev.filter(s => s.id !== schedaId));
            setConfermaEliminaSchedaId(null);
            setEserciziSchedaMap(prev => { const m = { ...prev }; delete m[schedaId]; return m; });
            if (schedaAperta === schedaId) setSchedaAperta(null);
        } catch {
            setErroreEliminaScheda("Errore durante l'eliminazione. Riprova.");
        } finally {
            setEliminandoSchedaId(null);
        }
    };

    // ── Elimina dieta ─────────────────────────────────────────────────────────

    const handleEliminaDieta = async (dietaId: number) => {
        setErroreEliminaDieta(null);
        setEliminandoDietaId(dietaId);
        try {
            await eliminaDieta(dietaId);
            setDieteCoachState(prev => prev.filter(d => d.id !== dietaId));
            setConfermaEliminaDietaId(null);
        } catch {
            setErroreEliminaDieta("Errore durante l'eliminazione. Riprova.");
        } finally {
            setEliminandoDietaId(null);
        }
    };

    // ── Render log card ───────────────────────────────────────────────────────

    const renderLogCard = (log: LogAllenamento, sezione: 'ultimi7' | 'storico') => (
        <li
            key={`${sezione}-${log.id}`}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
            <div className="px-5 py-4 flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">
                    {new Date(log.data).toLocaleDateString('it-IT', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                </span>
                {log.note
                    ? <p className="text-sm text-gray-500">{log.note}</p>
                    : <p className="text-xs text-gray-300 italic">Nessuna nota</p>
                }
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <button
                        onClick={() => toggleEserciziLog(log.id)}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                    >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Esercizi svolti
                        {eserciziLogAperti === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={() => toggleCommenti(log.id)}
                        className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Commenti
                        {commentiAperti === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={() => {
                            setFormCommentoAperto(prev => (prev === log.id ? null : log.id));
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

            {eserciziLogAperti === log.id && (
                <div className="border-t border-gray-100 bg-slate-50 px-5 py-4 flex flex-col gap-3">
                    {loadingEserciziLogMap[log.id] ? (
                        <p className="text-xs text-gray-400">Caricamento esercizi...</p>
                    ) : (eserciziLogMap[log.id] ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400">Nessun esercizio trovato.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {(eserciziLogMap[log.id] ?? []).map((esercizio: any) => (
                                <div key={esercizio.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-slate-700">{esercizio.nomeEsercizio}</span>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                            {esercizio.serie != null && <span>Serie: {esercizio.serie}</span>}
                                            {esercizio.ripetizioni != null && <span>Ripetizioni: {esercizio.ripetizioni}</span>}
                                            {esercizio.peso != null && <span>Peso: {esercizio.peso} kg</span>}
                                            {esercizio.durata != null && <span>Durata: {esercizio.durata} min</span>}
                                        </div>
                                        {(esercizio.commento ?? esercizio.note) && (
                                            <p className="text-xs text-slate-400 italic">{esercizio.commento ?? esercizio.note}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {commentiAperti === log.id && (
                <>
                    <CommentoAllenamentoComponent
                        commenti={commentiMap[log.id] ?? []}
                        loading={loadingCommentiMap[log.id] ?? false}
                        onElimina={(commentoId) => handleEliminaCommento(log.id, commentoId)}
                    />
                    {formCommentoAperto === log.id && (
                        <div className="px-5 py-4 border-t border-green-100 bg-white">
                            <form onSubmit={(e) => handleInviaCommento(e, log.id)} className="flex flex-col gap-2">
                                <textarea
                                    value={testoCommento}
                                    onChange={(e) => setTestoCommento(e.target.value)}
                                    placeholder="Scrivi un commento per questo allenamento..."
                                    rows={2}
                                    required
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none
                                               focus:outline-none focus:border-green-700 focus:ring-1
                                               focus:ring-green-700 transition-colors bg-white"
                                />
                                {erroreCommento && <p className="text-xs text-red-600">{erroreCommento}</p>}
                                <button
                                    type="submit"
                                    disabled={salvataggioCommento}
                                    className="self-end flex items-center gap-2 text-sm bg-green-700
                                               hover:bg-green-800 disabled:opacity-50 text-white font-semibold
                                               px-4 py-2 rounded-lg transition-colors cursor-pointer"
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
    );

    // ── Guard ─────────────────────────────────────────────────────────────────

    if (!utente) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-4">
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

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla dashboard
                </button>

                {/* Header utente */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
                    <h1 className="text-xl font-bold text-gray-800">{utente.nome} {utente.cognome}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">@{utente.username} · {utente.email}</p>
                </div>

                {/* ── Allenamenti ultimi 7 giorni ── */}
                <Sezione
                    icon={<Dumbbell className="w-5 h-5" />}
                    titolo="Allenamenti ultimi 7 giorni"
                    colore="text-green-700"
                >
                    {loadingUltimi ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : ultimiLogs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nessun allenamento negli ultimi 7 giorni.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {ultimiLogs.map(log => renderLogCard(log, 'ultimi7'))}
                        </ul>
                    )}
                </Sezione>

                {/* ── Storico completo ── */}
                <Sezione
                    icon={<FileText className="w-5 h-5" />}
                    titolo="Storico completo allenamenti"
                    colore="text-emerald-700"
                    defaultAperta={false}
                >
                    {loadingStorico ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : storicoCompleto.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-400">
                            Nessun allenamento registrato.
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {storicoCompleto.map(log => renderLogCard(log, 'storico'))}
                        </ul>
                    )}
                </Sezione>

                {/* ── Schede assegnate ── */}
                <Sezione
                    icon={<ClipboardList className="w-5 h-5" />}
                    titolo="Schede assegnate"
                    colore="text-blue-700"
                >
                    {loadingSchede ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : schedeUtente.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-400">
                            Nessuna scheda assegnata a questo utente.
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {schedeUtente.map((scheda: any) => (
                                <li key={scheda.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-5 py-4 flex flex-col gap-2">

                                        {/* Titolo + elimina */}
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {scheda.nome ?? scheda.titolo ?? `Scheda #${scheda.id}`}
                                            </span>

                                            {confermaEliminaSchedaId === scheda.id ? (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Sicuro?
                                                    </span>
                                                    <button
                                                        onClick={() => handleEliminaScheda(scheda.id)}
                                                        disabled={eliminandoSchedaId === scheda.id}
                                                        className="text-xs font-semibold text-white bg-red-500
                                                                   hover:bg-red-600 disabled:opacity-50
                                                                   px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        {eliminandoSchedaId === scheda.id ? 'Eliminazione...' : 'Elimina'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setConfermaEliminaSchedaId(null); setErroreEliminaScheda(null); }}
                                                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                    >
                                                        Annulla
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setConfermaEliminaSchedaId(scheda.id); setErroreEliminaScheda(null); }}
                                                    className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                                    title="Elimina scheda"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {erroreEliminaScheda && confermaEliminaSchedaId === scheda.id && (
                                            <p className="text-xs text-red-500">{erroreEliminaScheda}</p>
                                        )}

                                        {(scheda.descrizione ?? scheda.note) && (
                                            <p className="text-sm text-gray-500">{scheda.descrizione ?? scheda.note}</p>
                                        )}
                                        {scheda.dataCreazione && (
                                            <p className="text-xs text-gray-400">
                                                Creata il {new Date(scheda.dataCreazione).toLocaleDateString('it-IT')}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => toggleEserciziScheda(scheda.id)}
                                            className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors w-fit cursor-pointer"
                                        >
                                            <ClipboardList className="w-3.5 h-3.5" />
                                            Esercizi della scheda
                                            {schedaAperta === scheda.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    </div>

                                    {schedaAperta === scheda.id && (
                                        <div className="border-t border-gray-100 bg-slate-50 px-5 py-4 flex flex-col gap-3">
                                            {loadingEserciziSchedaMap[scheda.id] ? (
                                                <p className="text-xs text-gray-400">Caricamento esercizi...</p>
                                            ) : (eserciziSchedaMap[scheda.id] ?? []).length === 0 ? (
                                                <p className="text-xs text-gray-400">Nessun esercizio nella scheda.</p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {(eserciziSchedaMap[scheda.id] ?? []).map((es: any) => (
                                                        <div key={es.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-semibold text-slate-700">{es.nomeEsercizio}</span>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                                    {es.serie != null && <span>Serie: {es.serie}</span>}
                                                                    {es.ripetizioni != null && <span>Ripetizioni: {es.ripetizioni}</span>}
                                                                    {es.recupero != null && <span>Recupero: {es.recupero} sec</span>}
                                                                    {es.peso != null && <span>Peso: {es.peso} kg</span>}
                                                                    {es.durata != null && <span>Durata: {es.durata} min</span>}
                                                                </div>
                                                                {(es.note ?? es.commento) && (
                                                                    <p className="text-xs text-slate-400 italic">{es.note ?? es.commento}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </Sezione>

                {/* ── Diete assegnate ── */}
                <Sezione
                    icon={<Apple className="w-5 h-5" />}
                    titolo="Diete assegnate"
                    colore="text-orange-600"
                >
                    {loadingDiete ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : dieteUtente.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-400">
                            Nessuna dieta assegnata a questo utente.
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {dieteUtente.map((dieta: any) => (
                                <li key={dieta.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col gap-2">

                                    {/* Titolo + elimina */}
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {dieta.nome ?? dieta.titolo ?? `Dieta #${dieta.id}`}
                                        </span>

                                        {confermaEliminaDietaId === dieta.id ? (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Sicuro?
                                                </span>
                                                <button
                                                    onClick={() => handleEliminaDieta(dieta.id)}
                                                    disabled={eliminandoDietaId === dieta.id}
                                                    className="text-xs font-semibold text-white bg-red-500
                                                               hover:bg-red-600 disabled:opacity-50
                                                               px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {eliminandoDietaId === dieta.id ? 'Eliminazione...' : 'Elimina'}
                                                </button>
                                                <button
                                                    onClick={() => { setConfermaEliminaDietaId(null); setErroreEliminaDieta(null); }}
                                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                >
                                                    Annulla
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setConfermaEliminaDietaId(dieta.id); setErroreEliminaDieta(null); }}
                                                className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                                title="Elimina dieta"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {erroreEliminaDieta && confermaEliminaDietaId === dieta.id && (
                                        <p className="text-xs text-red-500">{erroreEliminaDieta}</p>
                                    )}

                                    {(dieta.descrizione ?? dieta.note) && (
                                        <p className="text-sm text-gray-500">{dieta.descrizione ?? dieta.note}</p>
                                    )}
                                    {dieta.dataCreazione && (
                                        <p className="text-xs text-gray-400">
                                            Creata il {new Date(dieta.dataCreazione).toLocaleDateString('it-IT')}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </Sezione>

            </main>
        </div>
    );
}