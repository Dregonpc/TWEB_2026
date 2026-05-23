import { useState } from 'react';
import type { Dieta } from '../types';
import {
    Salad,
    ChevronDown,
    ChevronUp,
    User,
    Trash2,
    AlertTriangle
} from 'lucide-react';

type Props = {
    dieta: Dieta;
    variant?: 'utente' | 'coach';
    onDelete?: (id: number) => Promise<void> | void;
};

export default function DietaCard({
    dieta,
    variant = 'utente',
    onDelete
}: Props) {

    const [aperta, setAperta] = useState(false);

    const [confermaElimina, setConfermaElimina] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const handleDelete = async () => {
        if (!onDelete) return;

        try {
            setEliminando(true);

            await onDelete(dieta.id);

        } finally {
            setEliminando(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4">

                <button
                    onClick={() => setAperta(prev => !prev)}
                    className="flex-1 flex items-center justify-between
                               hover:bg-gray-50 transition-colors text-left rounded-xl"
                >
                    <div className="flex flex-col gap-0.5">

                        <span className="text-sm font-semibold text-gray-800">
                            {dieta.titolo}
                        </span>

                        <span className="text-xs text-gray-400 flex items-center gap-1">

                            {variant === 'utente' ? (
                                <>
                                    Coach: {dieta.coach.nome} {dieta.coach.cognome}
                                </>
                            ) : (
                                <>
                                    <User className="w-3 h-3" />
                                    {dieta.utente.nome} {dieta.utente.cognome}
                                </>
                            )}

                        </span>
                    </div>

                    {aperta ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>

                {/* DELETE */}
                {variant === 'coach' && onDelete && (
                    <div className="ml-3 shrink-0">

                        {confermaElimina ? (
                            <div className="flex items-center gap-2">

                                <span className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Sicuro?
                                </span>

                                <button
                                    onClick={handleDelete}
                                    disabled={eliminando}
                                    className="text-xs font-semibold text-white bg-red-500
                                               hover:bg-red-600 disabled:opacity-50
                                               px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    {eliminando ? '...' : 'Elimina'}
                                </button>

                                <button
                                    onClick={() => setConfermaElimina(false)}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                >
                                    Annulla
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfermaElimina(true)}
                                className="flex items-center gap-1 text-xs text-slate-300
                                           hover:text-red-400 transition-colors"
                                title="Elimina dieta"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}

                    </div>
                )}
            </div>

            {/* CONTENUTO */}
            {aperta && (
                <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-4">

                    {/* DESCRIZIONE */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Descrizione
                        </span>

                        <p className="text-sm text-gray-700 whitespace-pre-line">
                            {dieta.descrizione}
                        </p>
                    </div>

                    {/* FOOTER INFO */}
                    <div className={`
                        flex items-center gap-2 rounded-lg px-4 py-3
                        ${variant === 'utente'
                            ? 'bg-orange-50'
                            : 'bg-emerald-50'}
                    `}>

                        <Salad className={`
                            w-4 h-4 shrink-0
                            ${variant === 'utente'
                                ? 'text-orange-400'
                                : 'text-emerald-500'}
                        `} />

                        <p className={`
                            text-xs
                            ${variant === 'utente'
                                ? 'text-orange-700'
                                : 'text-emerald-700'}
                        `}>

                            {variant === 'utente' ? (
                                <>
                                    Dieta creata da{' '}
                                    <span className="font-semibold">
                                        {dieta.coach.nome} {dieta.coach.cognome}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Dieta assegnata a{' '}
                                    <span className="font-semibold">
                                        {dieta.utente.nome} {dieta.utente.cognome}
                                    </span>
                                </>
                            )}

                        </p>
                    </div>

                </div>
            )}
        </div>
    );
}