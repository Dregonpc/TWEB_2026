import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { utente, logout } = useAuth();
    const navigate = useNavigate();
    const [menuAperto, setMenuAperto] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Chiude il menu mobile dopo aver cliccato un link
    const chiudiMenu = () => setMenuAperto(false);

    // Badge colorato per il ruolo
    const ruoloBadge: Record<string, string> = {
        USER:      'bg-blue-100 text-blue-700',
        COACH:     'bg-orange-100 text-orange-700',
        PSICOLOGO: 'bg-purple-100 text-purple-700',
    };

    // Link di navigazione in base al ruolo
    const LinkNavigazione = ({ mobile = false }: { mobile?: boolean }) => {
        const base = mobile
            ? 'block px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors'
            : 'text-sm font-medium text-white hover:text-green-200 transition-colors';

        return (
            <>
                <Link to="/dashboard" className={base} onClick={chiudiMenu}>
                    Dashboard
                </Link>

                {utente?.ruolo === 'USER' && (
                    <>
                        <Link to="/log-allenamento" className={base} onClick={chiudiMenu}>
                            Allenamento
                        </Link>
                        <Link to="/log-benessere" className={base} onClick={chiudiMenu}>
                            Benessere
                        </Link>
                        <Link to="/statistiche" className={base} onClick={chiudiMenu}>
                            Statistiche
                        </Link>
                    </>
                )}

                {utente?.ruolo === 'COACH' && (
                    <>
                        <Link to="/utenti" className={base} onClick={chiudiMenu}>
                            I miei utenti
                        </Link>
                        <Link to="/scheda-allenamento/crea" className={base} onClick={chiudiMenu}>
                            Crea scheda
                        </Link>
                        <Link to="/dieta/crea" className={base} onClick={chiudiMenu}>
                            Crea dieta
                        </Link>
                    </>
                )}

                {utente?.ruolo === 'PSICOLOGO' && (
                    <Link to="/utenti" className={base} onClick={chiudiMenu}>
                        I miei utenti
                    </Link>
                )}
            </>
        );
    };

    return (
        <nav className="bg-green-800 text-white shadow-md">

            {/* Barra principale */}
            <div className="px-6 py-3 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
                >
                    🌿 <span>Wellness Tracker</span>
                </Link>

                {/* Link desktop nascosti su mobile */}
                <div className="hidden md:flex items-center gap-6">
                    <LinkNavigazione />
                </div>

                {/* Area destra info utente + hamburger */}
                <div className="flex items-center gap-3">

                    {/* Info utente visibile solo su desktop */}
                    <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-green-100">
              {utente?.nome} {utente?.cognome}
            </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
              {utente?.ruolo}
            </span>
                    </div>

                    {/* Bottone logout visibile solo su desktop */}
                    <button
                        onClick={handleLogout}
                        className="hidden md:block text-sm bg-green-700 hover:bg-green-600
                       px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        Esci
                    </button>

                    {/* Bottone hamburger visibile solo su mobile */}
                    <button
                        onClick={() => setMenuAperto(!menuAperto)}
                        className="md:hidden flex flex-col justify-center items-center
                       w-9 h-9 rounded-lg hover:bg-green-700 transition-colors cursor-pointer gap-1.5"
                        aria-label="Apri menu"
                    >
                        {/* Le tre righe dell'hamburger si trasformano in X quando aperto */}
                        <span className={`block w-5 h-0.5 bg-white transition-all duration-300
              ${menuAperto ? 'rotate-45 translate-y-2' : ''}`}
                        />
                        <span className={`block w-5 h-0.5 bg-white transition-all duration-300
              ${menuAperto ? 'opacity-0' : ''}`}
                        />
                        <span className={`block w-5 h-0.5 bg-white transition-all duration-300
              ${menuAperto ? '-rotate-45 -translate-y-2' : ''}`}
                        />
                    </button>

                </div>
            </div>

            {/* Menu mobile a comparsa */}
            <div className={`md:hidden overflow-hidden transition-all duration-300
        ${menuAperto ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="border-t border-green-700 pb-2">

                    {/* Link di navigazione */}
                    <LinkNavigazione mobile />

                    {/* Separatore */}
                    <div className="border-t border-green-700 mt-2 pt-2 px-4">

                        {/* Info utente nel menu mobile */}
                        <div className="flex items-center gap-2 py-2">
              <span className="text-sm text-green-100">
                {utente?.nome} {utente?.cognome}
              </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
                {utente?.ruolo}
              </span>
                        </div>

                        {/* Bottone logout mobile */}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-sm text-red-300 hover:text-red-200
                         py-2 transition-colors cursor-pointer"
                        >
                            Esci →
                        </button>
                    </div>
                </div>
            </div>

        </nav>
    );
}