import type { CommentoAllenamento } from '../types';

interface Props {
    commenti: CommentoAllenamento[];
    loading?: boolean;
}

export default function CommentoAllenamentoComponent({
                                                         commenti,
                                                         loading = false,
                                                     }: Props) {
    return (
        <div className="border-t border-slate-100 bg-green-50 px-5 py-4 flex flex-col gap-3">
            {loading ? (
                <p className="text-xs text-slate-400">
                    Caricamento commenti...
                </p>
            ) : commenti.length === 0 ? (
                <p className="text-xs text-slate-400">
                    Nessun commento ricevuto.
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {commenti.map((commento) => (
                        <li key={commento.id} className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-green-700">
                                {commento.coach.nome} {commento.coach.cognome}
                                <span className="font-normal text-gray-400 ml-2">
                                    {new Date(commento.data).toLocaleDateString('it-IT')}
                                </span>
                            </span>

                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                {commento.testo}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}