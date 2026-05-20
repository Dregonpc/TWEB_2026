import { useState } from 'react';
import type { Dieta } from '../types';
import {
    Salad,
    ChevronDown,
    ChevronUp,
    User
} from 'lucide-react';

type Props = {
    dieta: Dieta;
    variant?: 'utente' | 'coach';
};

export default function DietaCard({
    dieta,
    variant = 'utente'
}: Props) {

    const [aperta, setAperta] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* HEADER */}
            <button
                onClick={() => setAperta(prev => !prev)}
                className="w-full flex items-center justify-between px-5 py-4
                           hover:bg-gray-50 transition-colors text-left"
            >
                <div className="flex flex-col gap-0.5">

                    <span className="text-sm font-semibold text-gray-800">
                        {dieta.titolo}
                    </span>

                    {/* INFO SECONDARIA */}
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