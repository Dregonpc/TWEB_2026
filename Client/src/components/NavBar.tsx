import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Leaf } from 'lucide-react';

const ruoloBadge: Record<string, string> = {
    USER:      'bg-blue-100 text-blue-700',
    COACH:     'bg-orange-100 text-orange-700',
    PSICOLOGO: 'bg-purple-100 text-purple-700',
};

export default function NavBar() {
    const { utente, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [menuAperto, setMenuAperto] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const chiudiMenu = () => setMenuAperto(false);

    const linkClass = (path: string, mobile: boolean) => {
        const attivo = pathname === path ? 'underline underline-offset-4' : '';
        return mobile
            ? `block px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors ${attivo}`
            : `text-sm font-medium text-white hover:text-green-200 transition-colors ${attivo}`;
    };

    const links = (mobile = false) => (
        <>
            <Link to="/dashboard" className={linkClass('/dashboard', mobile)} onClick={chiudiMenu}>
                Dashboard
            </Link>

            {utente?.ruolo === 'USER' && (
                <>
                    <Link to="/allenamento" className={linkClass('/allenamento', mobile)} onClick={chiudiMenu}>
                        Allenamento
                    </Link>
                    <Link to="/benessere" className={linkClass('/benessere', mobile)} onClick={chiudiMenu}>
                        Benessere
                    </Link>
                    <Link to="/schede" className={linkClass('/schede', mobile)} onClick={chiudiMenu}>
                        Schede
                    </Link>
                    <Link to="/dieta" className={linkClass('/dieta', mobile)} onClick={chiudiMenu}>
                        Dieta
                    </Link>
                </>
            )}

            {utente?.ruolo === 'COACH' && (
                <>
                    <Link to="/coach/schede" className={linkClass('/coach/schede', mobile)} onClick={chiudiMenu}>
                        Gestisci schede
                    </Link>
                </>
            )}

            {/* Il psicologo naviga sugli utenti dalla dashboard, nessun link aggiuntivo fisso */}
            {utente?.ruolo === 'PSICOLOGO' && (null)}
        </>
    );

    return (
        <nav className="bg-green-800 text-white shadow-md">

            {/* Barra principale */}
            <div className="px-6 py-3 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
                >
                    <Leaf className="w-5 h-5" />
                    <span>Wellness Tracker</span>
                </Link>

                {/* Link desktop */}
                <div className="hidden md:flex items-center gap-6">
                    {links()}
                </div>

                {/* Area destra */}
                <div className="flex items-center gap-3">

                    {/* Info utente — solo desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm text-green-100">
                            {utente?.nome} {utente?.cognome}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
                            {utente?.ruolo}
                        </span>
                    </div>

                    {/* Logout — solo desktop */}
                    <button
                        onClick={handleLogout}
                        aria-label="Logout"
                        className="hidden md:flex items-center justify-center bg-red-500 hover:bg-red-400
                                   p-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>

                    {/* Hamburger — solo mobile */}
                    <button
                        onClick={() => setMenuAperto(prev => !prev)}
                        className="md:hidden flex flex-col justify-center items-center
                                   w-9 h-9 rounded-lg hover:bg-green-700 transition-colors cursor-pointer gap-1.5"
                        aria-label={menuAperto ? 'Chiudi menu' : 'Apri menu'}
                    >
                        <span className={`block w-5 h-0.5 bg-white transition-all duration-300
                                         ${menuAperto ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-white transition-all duration-300
                                         ${menuAperto ? 'opacity-0' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-white transition-all duration-300
                                         ${menuAperto ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>

                </div>
            </div>

            {/* Menu mobile */}
            <div className={`md:hidden overflow-hidden transition-all duration-300
                             ${menuAperto ? 'max-h-96' : 'max-h-0'}`}>
                <div className="border-t border-green-700 pb-2">

                    {links(true)}

                    <div className="border-t border-green-700 mt-2 pt-2 px-4">
                        <div className="flex items-center gap-2 py-2">
                            <span className="text-sm text-green-100">
                                {utente?.nome} {utente?.cognome}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
                                {utente?.ruolo}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className=" text-left text-sm px-3 py-2 rounded-lg bg-red-500
                                        transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 red" />
                        </button>
                    </div>
                </div>
            </div>

        </nav>
    );
}