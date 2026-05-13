import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getListaUtenti } from '../api/utenteApi';
import type { Utente } from '../types';
import { Users, ChevronRight, Search } from 'lucide-react';

export default function ListaUtentiPsicologoPage() {
    const navigate = useNavigate();
    const [utenti, setUtenti] = useState<Utente[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        getListaUtenti()
            .then(setUtenti)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const utentiFiltrati = utenti.filter(u =>
        `${u.nome} ${u.cognome} ${u.username}`.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">I miei pazienti</h1>
                        <p className="text-sm text-slate-400">Seleziona un paziente per visualizzare i log benessere</p>
                    </div>
                </div>

                {/* Barra di ricerca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cerca paziente per nome o username..."
                        value={filtro}
                        onChange={e => setFiltro(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl
                                   text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />)}
                    </div>
                ) : utentiFiltrati.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 flex flex-col items-center gap-3 text-center border border-slate-100">
                        <Users className="w-10 h-10 text-slate-200" />
                        <p className="font-semibold text-slate-400">Nessun paziente trovato</p>
                        <p className="text-sm text-slate-300">
                            {filtro ? 'Prova a modificare la ricerca' : 'Non ci sono utenti nel sistema'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {utentiFiltrati.map(u => (
                            <button
                                key={u.id}
                                onClick={() => navigate(`/psicologo/utente/${u.id}`, { state: { utente: u } })}
                                className="bg-white flex items-center gap-4 px-5 py-4 rounded-xl
                                           border border-slate-100 hover:border-purple-200
                                           hover:shadow-sm transition-all text-left"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center
                                                justify-center text-purple-700 font-bold text-sm shrink-0">
                                    {u.nome.charAt(0)}{u.cognome.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">
                                        {u.nome} {u.cognome}
                                    </p>
                                    <p className="text-xs text-slate-400">@{u.username}</p>
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                            </button>
                        ))}
                    </div>
                )}

                {!loading && utenti.length > 0 && (
                    <p className="text-xs text-slate-400 text-center">
                        {utenti.length} {utenti.length === 1 ? 'paziente' : 'pazienti'} nel sistema
                    </p>
                )}

            </main>
        </div>
    );
}