import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { getStoricoBenessere, salvaLogBenessere, getCommentiLogBenessere } from '../api/benessereApi';
import type { LogBenessere, CommentoBenessere } from '../types';
import { Heart, Plus, X, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LogBenesserePage() {
    const { utente } = useAuth();

    const [storico, setStorico] = useState<LogBenessere[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostraForm, setMostraForm] = useState(false);

    // Campi form
    const [data, setData] = useState('');
    const [livelloUmore, setLivelloUmore] = useState<number>(5);
    const [livelloSonno, setLivelloSonno] = useState<number>(5);
    const [livelloStress, setLivelloStress] = useState<number>(5);
    const [noteDiario, setNoteDiario] = useState('');
    const [salvataggio, setSalvataggio] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);

    // Commenti psicologo — caricati on demand
    const [commentiMap, setCommentiMap] = useState<Record<number, CommentoBenessere[]>>({});
    const [loadingCommentiMap, setLoadingCommentiMap] = useState<Record<number, boolean>>({});
    const [commentiAperti, setCommentiAperti] = useState<number | null>(null);

    useEffect(() => {
        caricaStorico();
    }, []);

    const caricaStorico = async () => {
        try {
            const logs = await getStoricoBenessere(utente!.id);
            setStorico(logs);
        } catch (err) {
            console.error('Errore caricamento storico benessere:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrore(null);
        setSalvataggio(true);
        try {
            const nuovoLog = await salvaLogBenessere({
                data,
                livelloUmore,
                livelloSonno,
                livelloStress,
                noteDiario: noteDiario || null,
            });
            setStorico(prev => [nuovoLog, ...prev]);
            // Reset form
            setData('');
            setLivelloUmore(5);
            setLivelloSonno(5);
            setLivelloStress(5);
            setNoteDiario('');
            setMostraForm(false);
        } catch {
            setErrore('Errore durante il salvataggio. Riprova.');
        } finally {
            setSalvataggio(false);
        }
    };

    const toggleCommenti = async (logId: number) => {
        if (commentiAperti === logId) {
            setCommentiAperti(null);
            return;
        }

        setCommentiAperti(logId);

        // Carica commenti solo se non già in cache
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

    // Componente slider riutilizzato per i 3 valori
    const SliderValore = ({
                              id, label, value, onChange, colore
                          }: {
        id: string;
        label: string;
        value: number;
        onChange: (v: number) => void;
        colore: string;
    }) => (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <label htmlFor={id} className="text-sm font-semibold text-gray-600">
                    {label}
                </label>
                <span className={`text-sm font-bold ${colore}`}>{value}/10</span>
            </div>
            <input
                id={id}
                type="range"
                min={1}
                max={10}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-green-700"
            />
            <div className="flex justify-between text-xs text-gray-300">
                <span>1</span>
                <span>10</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-purple-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Il mio benessere</h1>
                    </div>
                    <button
                        onClick={() => setMostraForm(prev => !prev)}
                        className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700
                                   text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        {mostraForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {mostraForm ? 'Annulla' : 'Nuovo log'}
                    </button>
                </div>

                {/* Form nuovo log */}
                {mostraForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5"
                    >
                        <h2 className="text-lg font-semibold text-gray-700">Registra benessere</h2>

                        {/* Data */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="data" className="text-sm font-semibold text-gray-600">
                                Data *
                            </label>
                            <input
                                id="data"
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                           focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600
                                           transition-colors"
                            />
                        </div>

                        {/* Slider valori */}
                        <SliderValore
                            id="umore"
                            label="😊 Umore"
                            value={livelloUmore}
                            onChange={setLivelloUmore}
                            colore="text-yellow-500"
                        />
                        <SliderValore
                            id="sonno"
                            label="😴 Qualità del sonno"
                            value={livelloSonno}
                            onChange={setLivelloSonno}
                            colore="text-blue-500"
                        />
                        <SliderValore
                            id="stress"
                            label="😰 Livello di stress"
                            value={livelloStress}
                            onChange={setLivelloStress}
                            colore="text-red-500"
                        />

                        {/* Note diario */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="note" className="text-sm font-semibold text-gray-600">
                                Note diario <span className="text-gray-400 font-normal">(opzionale)</span>
                            </label>
                            <textarea
                                id="note"
                                value={noteDiario}
                                onChange={(e) => setNoteDiario(e.target.value)}
                                placeholder="Come ti sei sentito oggi?"
                                rows={3}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none
                                           focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600
                                           transition-colors"
                            />
                        </div>

                        {/* Errore */}
                        {errore && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                {errore}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={salvataggio}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                                       text-white font-semibold rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
                        >
                            {salvataggio ? 'Salvataggio...' : 'Salva'}
                        </button>
                    </form>
                )}

                {/* Storico */}
                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold text-gray-700">Storico</h2>

                    {loading ? (
                        <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : storico.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                            <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nessun log benessere registrato.</p>
                            <p className="text-xs mt-1">Premi "Nuovo log" per iniziare!</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {storico.map((log) => (
                                <li
                                    key={log.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Contenuto log */}
                                    <div className="px-5 py-4 flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {new Date(log.data).toLocaleDateString('it-IT', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>

                                        {/* Valori */}
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            {log.livelloUmore  !== null && <span>😊 {log.livelloUmore}/10</span>}
                                            {log.livelloSonno  !== null && <span>😴 {log.livelloSonno}/10</span>}
                                            {log.livelloStress !== null && <span>😰 {log.livelloStress}/10</span>}
                                        </div>

                                        {/* Note diario */}
                                        {log.noteDiario && (
                                            <p className="text-sm text-gray-500 italic">"{log.noteDiario}"</p>
                                        )}

                                        {/* Toggle commenti psicologo */}
                                        <button
                                            onClick={() => toggleCommenti(log.id)}
                                            className="flex items-center gap-1.5 text-xs text-purple-500
                                                       hover:text-purple-700 transition-colors mt-1 w-fit cursor-pointer"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            Commenti psicologo
                                            {commentiAperti === log.id
                                                ? <ChevronUp className="w-3 h-3" />
                                                : <ChevronDown className="w-3 h-3" />
                                            }
                                        </button>
                                    </div>

                                    {/* Sezione commenti */}
                                    {commentiAperti === log.id && (
                                        <div className="border-t border-gray-100 bg-purple-50 px-5 py-4">
                                            {loadingCommentiMap[log.id] ? (
                                                <p className="text-xs text-gray-400">Caricamento commenti...</p>
                                            ) : !commentiMap[log.id] || commentiMap[log.id].length === 0 ? (
                                                <p className="text-xs text-gray-400">Nessun commento dello psicologo.</p>
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