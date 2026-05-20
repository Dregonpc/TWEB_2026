import type { CommentoBenessere } from '../types';

interface Props {
    commenti: CommentoBenessere[];
    loading?: boolean;
}

export default function CommentoBenessereComponent({
                                                       commenti,
                                                       loading = false,
                                                   }: Props) {
    return (
        <div className="border-t border-gray-100 bg-purple-50 px-5 py-4 flex flex-col gap-3">
            {loading ? (
                <p className="text-xs text-gray-400">
                    Caricamento commenti...
                </p>
            ) : commenti.length === 0 ? (
                <p className="text-xs text-gray-400">
                    Nessun commento dello psicologo.
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {commenti.map((commento) => (
                        <li key={commento.id} className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-purple-700">
                                {commento.psicologo.nome} {commento.psicologo.cognome}
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