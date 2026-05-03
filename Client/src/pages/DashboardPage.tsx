import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import {
    getLogAllenamento,
    getLogBenessere,
    getSchedeUtente,
    getDieteUtente,
    getUtentiSeguiti,
} from '../api/dashboardApi';
import type { LogAllenamento } from '../types/LogAllenamento';
import type { LogBenessere } from '../types/LogBenessere';
import type { SchedaAllenamento } from '../types/SchedaAllenamento';
import type { Dieta } from '../types/Dieta';
import type { Utente } from '../types/Utente';

// Componente card statistica
function StatCard({
                      emoji, label, valore, sub, colore,
                  }: {
    emoji: string;
    label: string;
    valore: string | number;
    sub?: string;
    colore: string;
}) {
    return (
        <div className={`bg-white rounded-xl border-l-4 ${colore} shadow-sm p-5 flex flex-col gap-1`}>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{emoji}</span>
                <span>{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{valore}</div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );
}

// Indicatore livello (umore/sonno/stress)
function LivelloBadge({ label, valore }: { label: string; valore: number | null }) {
    if (valore === undefined || valore === null) return null;
    const colore =
        valore >= 7 ? 'bg-green-100 text-green-700' :
            valore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700';
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colore}`}>
      {label}: {valore}/10
    </span>
    );
}

// Riga log allenamento
function RigaLog({ log, onClick }: { log: LogAllenamento; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center justify-between px-4 py-3
                 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
        >
            <div>
                <div className="text-sm font-medium text-gray-800">
                    {new Date(log.data).toLocaleDateString('it-IT', {
                        weekday: 'short', day: 'numeric', month: 'short',
                    })}
                </div>
                {log.note && (
                    <div className="text-xs text-gray-400 truncate max-w-xs">{log.note}</div>
                )}
            </div>
            <span className="text-xs text-gray-400">→</span>
        </button>
    );
}

// Riga log benessere
function RigaBenessere({ log, onClick }: { log: LogBenessere; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center justify-between px-4 py-3
                 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
        >
            <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-gray-800">
                    {new Date(log.data).toLocaleDateString('it-IT', {
                        weekday: 'short', day: 'numeric', month: 'short',
                    })}
                </div>
                <div className="flex gap-1 flex-wrap">
                    <LivelloBadge label="😊 Umore" valore={log.livelloUmore} />
                    <LivelloBadge label="😴 Sonno" valore={log.livelloSonno} />
                    <LivelloBadge label="😤 Stress" valore={log.livelloStress} />
                </div>
            </div>
            <span className="text-xs text-gray-400">→</span>
        </button>
    );
}

// Sezione con titolo e link "vedi tutti"
function Sezione({
                     titolo, linkPath, linkLabel, children, loading,
                 }: {
    titolo: string;
    linkPath?: string;
    linkLabel?: string;
    children: React.ReactNode;
    loading?: boolean;
}) {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700 text-sm">{titolo}</h2>
                {linkPath && (
                    <button
                        onClick={() => navigate(linkPath)}
                        className="text-xs text-green-700 hover:text-green-800 font-medium cursor-pointer"
                    >
                        {linkLabel ?? 'Vedi tutti →'}
                    </button>
                )}
            </div>
            <div className="divide-y divide-gray-50">
                {loading ? (
                    <div className="px-5 py-4 text-sm text-gray-400">Caricamento...</div>
                ) : children}
            </div>
        </div>
    );
}

// Stato vuoto
function Vuoto({ testo, azioneLabel, path }: {
    testo: string;
    azioneLabel?: string;
    path?: string;
}) {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center gap-2 py-6 text-center px-4">
            <p className="text-sm text-gray-400">{testo}</p>
            {path && azioneLabel && (
                <button
                    onClick={() => navigate(path)}
                    className="text-xs text-green-700 hover:underline cursor-pointer"
                >
                    {azioneLabel}
                </button>
            )}
        </div>
    );
}

// DASHBOARD USER
function DashboardUser() {
    const navigate = useNavigate();
    const [logAll, setLogAll] = useState<LogAllenamento[]>([]);
    const [logBen, setLogBen] = useState<LogBenessere[]>([]);
    const [schede, setSchede] = useState<SchedaAllenamento[]>([]);
    const [diete, setDiete] = useState<Dieta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getLogAllenamento(),
            getLogBenessere(),
            getSchedeUtente(),
            getDieteUtente(),
        ])
            .then(([a, b, s, d]) => {
                setLogAll(a.sort((x, y) => y.data.localeCompare(x.data)));
                setLogBen(b.sort((x, y) => y.data.localeCompare(x.data)));
                setSchede(s);
                setDiete(d);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Statistiche veloci --- filtra null prima di calcolare la media
    const ultimiBenessere = logBen.slice(0, 7);

    const valoriUmore = ultimiBenessere
        .filter(l => l.livelloUmore !== null)
        .map(l => l.livelloUmore as number);
    const mediaUmore = valoriUmore.length
        ? Math.round(valoriUmore.reduce((s, v) => s + v, 0) / valoriUmore.length * 10) / 10
        : null;

    const valoriSonno = ultimiBenessere
        .filter(l => l.livelloSonno !== null)
        .map(l => l.livelloSonno as number);
    const mediaSonno = valoriSonno.length
        ? Math.round(valoriSonno.reduce((s, v) => s + v, 0) / valoriSonno.length * 10) / 10
        : null;

    return (
        <div className="space-y-6">
            {/* KPI veloci */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard emoji="🏋️" label="Allenamenti totali"
                          valore={loading ? '–' : logAll.length} colore="border-blue-400" />
                <StatCard emoji="🧘" label="Log benessere"
                          valore={loading ? '–' : logBen.length} colore="border-purple-400" />
                <StatCard emoji="😊" label="Media umore (7gg)"
                          valore={loading ? '–' : (mediaUmore ?? '–')} sub="scala 1-10" colore="border-yellow-400" />
                <StatCard emoji="😴" label="Media sonno (7gg)"
                          valore={loading ? '–' : (mediaSonno ?? '–')} sub="scala 1-10" colore="border-green-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ultimi allenamenti */}
                <Sezione
                    titolo="🏋️ Ultimi allenamenti"
                    linkPath="/log-allenamento"
                    linkLabel="Registra / Vedi tutti →"
                    loading={loading}
                >
                    {logAll.length === 0 ? (
                        <Vuoto
                            testo="Nessun allenamento registrato"
                            path="/log-allenamento"
                            azioneLabel="Registra il primo →"
                        />
                    ) : (
                        logAll.slice(0, 5).map(log => (
                            <RigaLog
                                key={log.id}
                                log={log}
                                onClick={() => navigate(`/log-allenamento/${log.id}`)}
                            />
                        ))
                    )}
                </Sezione>

                {/* Ultimi log benessere */}
                <Sezione
                    titolo="🧘 Ultimi log benessere"
                    linkPath="/log-benessere"
                    linkLabel="Registra / Vedi tutti →"
                    loading={loading}
                >
                    {logBen.length === 0 ? (
                        <Vuoto
                            testo="Nessun log benessere registrato"
                            path="/log-benessere"
                            azioneLabel="Registra il primo →"
                        />
                    ) : (
                        logBen.slice(0, 4).map(log => (
                            <RigaBenessere
                                key={log.id}
                                log={log}
                                onClick={() => navigate(`/log-benessere/${log.id}`)}
                            />
                        ))
                    )}
                </Sezione>

                {/* Schede assegnate */}
                <Sezione titolo="📋 Schede del coach" loading={loading}>
                    {schede.length === 0 ? (
                        <Vuoto testo="Nessuna scheda assegnata dal coach" />
                    ) : (
                        schede.slice(0, 3).map(s => (
                            <button
                                key={s.id}
                                onClick={() => navigate(`/scheda/${s.id}`)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                            >
                                <div className="text-sm font-medium text-gray-800">{s.titolo}</div>
                                <div className="text-xs text-gray-400">
                                    {s.dataCreazione
                                        ? new Date(s.dataCreazione).toLocaleDateString('it-IT')
                                        : '—'}
                                </div>
                            </button>
                        ))
                    )}
                </Sezione>

                {/* Dieta assegnata */}
                <Sezione titolo="🥗 Dieta del coach" loading={loading}>
                    {diete.length === 0 ? (
                        <Vuoto testo="Nessuna dieta assegnata dal coach" />
                    ) : (
                        diete.slice(0, 3).map(d => (
                            <button
                                key={d.id}
                                onClick={() => navigate(`/dieta/${d.id}`)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                            >
                                <div className="text-sm font-medium text-gray-800">{d.titolo}</div>
                                <div className="text-xs text-gray-400">
                                    {d.kcalTotali ? `${d.kcalTotali} kcal · ` : ''}
                                    {d.dataCreazione
                                        ? new Date(d.dataCreazione).toLocaleDateString('it-IT')
                                        : '—'}
                                </div>
                            </button>
                        ))
                    )}
                </Sezione>
            </div>
        </div>
    );
}

// DASHBOARD COACH
function DashboardCoach() {
    const navigate = useNavigate();
    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUtentiSeguiti()
            .then(setUtenti)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard emoji="👥" label="Utenti seguiti"
                          valore={loading ? '–' : utenti.length} colore="border-orange-400" />
                <StatCard emoji="📋" label="Crea scheda"
                          valore="+" sub="Nuova scheda allenamento" colore="border-blue-400" />
                <StatCard emoji="🥗" label="Crea dieta"
                          valore="+" sub="Nuovo piano alimentare" colore="border-green-400" />
            </div>

            {/* Lista utenti seguiti */}
            <Sezione
                titolo="👥 I tuoi utenti"
                linkPath="/utenti"
                linkLabel="Vedi tutti →"
                loading={loading}
            >
                {utenti.length === 0 ? (
                    <Vuoto testo="Nessun utente assegnato" />
                ) : (
                    utenti.slice(0, 6).map(u => (
                        <button
                            key={u.id}
                            onClick={() => navigate(`/utenti/${u.id}/allenamenti`)}
                            className="w-full text-left flex items-center justify-between px-4 py-3
                         hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                        >
                            <div>
                                <div className="text-sm font-medium text-gray-800">
                                    {u.nome} {u.cognome}
                                </div>
                                <div className="text-xs text-gray-400">@{u.username}</div>
                            </div>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                Allenamenti →
              </span>
                        </button>
                    ))
                )}
            </Sezione>

            {/* Azioni rapide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/scheda-allenamento/crea')}
                    className="bg-white border-2 border-dashed border-blue-200 hover:border-blue-400
                     hover:bg-blue-50 rounded-xl p-6 text-center transition-all cursor-pointer"
                >
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-semibold text-gray-700">Nuova scheda allenamento</div>
                    <div className="text-xs text-gray-400 mt-1">Crea un piano per un utente</div>
                </button>
                <button
                    onClick={() => navigate('/dieta/crea')}
                    className="bg-white border-2 border-dashed border-green-200 hover:border-green-400
                     hover:bg-green-50 rounded-xl p-6 text-center transition-all cursor-pointer"
                >
                    <div className="text-3xl mb-2">🥗</div>
                    <div className="font-semibold text-gray-700">Nuova dieta</div>
                    <div className="text-xs text-gray-400 mt-1">Crea un piano alimentare</div>
                </button>
            </div>
        </div>
    );
}

// DASHBOARD PSICOLOGO
function DashboardPsicologo() {
    const navigate = useNavigate();
    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUtentiSeguiti()
            .then(setUtenti)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard emoji="👥" label="Pazienti seguiti"
                          valore={loading ? '–' : utenti.length} colore="border-purple-400" />
                <StatCard emoji="🧘" label="Log benessere"
                          valore="📊" sub="Visualizza per paziente" colore="border-green-400" />
            </div>

            {/* Lista pazienti */}
            <Sezione
                titolo="👥 I tuoi pazienti"
                linkPath="/utenti"
                linkLabel="Vedi tutti →"
                loading={loading}
            >
                {utenti.length === 0 ? (
                    <Vuoto testo="Nessun paziente assegnato" />
                ) : (
                    utenti.slice(0, 6).map(u => (
                        <button
                            key={u.id}
                            onClick={() => navigate(`/utenti/${u.id}/benessere`)}
                            className="w-full text-left flex items-center justify-between px-4 py-3
                         hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                        >
                            <div>
                                <div className="text-sm font-medium text-gray-800">
                                    {u.nome} {u.cognome}
                                </div>
                                <div className="text-xs text-gray-400">@{u.username}</div>
                            </div>
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                Benessere →
              </span>
                        </button>
                    ))
                )}
            </Sezione>
        </div>
    );
}

// DASHBOARD PRINCIPALE
export default function DashboardPage() {
    const { utente } = useAuth();

    const ora = new Date().getHours();
    const saluto = ora < 12 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';

    const ruoloBadge: Record<string, string> = {
        USER:      'bg-blue-100 text-blue-700',
        COACH:     'bg-orange-100 text-orange-700',
        PSICOLOGO: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                {/* Intestazione */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {saluto}, {utente?.nome}! 👋
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {new Date().toLocaleDateString('it-IT', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                            })}
                        </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
            {utente?.ruolo}
          </span>
                </div>

                {/* Dashboard per ruolo */}
                {utente?.ruolo === 'USER'      && <DashboardUser />}
                {utente?.ruolo === 'COACH'     && <DashboardCoach />}
                {utente?.ruolo === 'PSICOLOGO' && <DashboardPsicologo />}

            </main>
        </div>
    );
}