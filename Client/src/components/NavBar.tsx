import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {LogOut, Leaf, LayoutDashboard, Dumbbell, Heart, ClipboardList, Salad, Users, Menu, X } from 'lucide-react';

const ruoloBadge: Record<string, string> = {
    USER:      'bg-blue-100 text-blue-700',
    COACH:     'bg-orange-100 text-orange-700',
    PSICOLOGO: 'bg-purple-100 text-purple-700',
};

interface NavLink {
    path: string;
    label: string;
    icon: React.ReactElement;
}

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

    const linksByRuolo: Record<string, NavLink[]> = {
        USER: [
            { path: '/dashboard',   label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
            { path: '/allenamento', label: 'Allenamento', icon: <Dumbbell className="w-4 h-4" /> },
            { path: '/benessere',   label: 'Benessere',   icon: <Heart className="w-4 h-4" /> },
            { path: '/schede',      label: 'Schede',      icon: <ClipboardList className="w-4 h-4" /> },
            { path: '/dieta',       label: 'Dieta',       icon: <Salad className="w-4 h-4" /> },
        ],
        COACH: [
            { path: '/dashboard',    label: 'Dashboard',       icon: <LayoutDashboard className="w-4 h-4" /> },
            { path: '/coach/schede', label: 'Gestisci schede', icon: <ClipboardList className="w-4 h-4" /> },
            { path: '/coach/utenti', label: 'I miei atleti',   icon: <Users className="w-4 h-4" /> },
            { path: '/coach/dieta',  label: 'Gestisci diete',  icon: <Salad className="w-4 h-4" /> },
        ],
        PSICOLOGO: [
            { path: '/dashboard',        label: 'Dashboard',    icon: <LayoutDashboard className="w-4 h-4" /> },
            { path: '/psicologo/utenti', label: 'I miei utenti', icon: <Users className="w-4 h-4" /> },
        ],
    };

    const links = linksByRuolo[utente?.ruolo ?? 'USER'] ?? [];

    const desktopLinkClass = (path: string) => {
        const attivo = pathname === path;
        return [
            'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors',
            attivo ? 'bg-green-700 text-white' : 'text-green-100 hover:text-white hover:bg-green-700',
        ].join(' ');
    };

    const mobileLinkClass = (path: string) => {
        const attivo = pathname === path;
        return [
            'flex items-center justify-end gap-3 px-4 py-3 text-sm font-medium transition-colors',
            attivo ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700 hover:text-white',
        ].join(' ');
    };

    return (
        <nav className="bg-green-800 text-white shadow-md w-full">

            {/* ── Barra principale ── */}
            <div className="w-full px-6 py-3 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 font-bold text-lg hover:opacity-80
                               transition-opacity shrink-0"
                >
                    <Leaf className="w-5 h-5 text-white" />
                    <span>WellnessTracker</span>
                </Link>

                {/* Link desktop */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {links.map(({ path, label, icon }) => (
                        <Link key={path} to={path} className={desktopLinkClass(path)}>
                            {icon}
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Area destra desktop */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    <span className="text-sm text-green-100">
                        {utente?.nome} {utente?.cognome}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                      ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
                        {utente?.ruolo}
                    </span>
                    <button
                        onClick={handleLogout}
                        aria-label="Logout"
                        className="flex items-center justify-center bg-red-500 hover:bg-red-400
                                   p-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>

                {/* Hamburger mobile */}
                <button
                    onClick={() => setMenuAperto(prev => !prev)}
                    className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg
                               hover:bg-green-700 transition-colors cursor-pointer"
                    aria-label={menuAperto ? 'Chiudi menu' : 'Apri menu'}
                >
                    {menuAperto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* ── Menu mobile — voci allineate a destra ── */}
            <div className={`md:hidden overflow-hidden transition-all duration-300
                             ${menuAperto ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="border-t border-green-700 flex flex-col pb-3">

                    {/* Links — testo + icona a destra */}
                    {links.map(({ path, label, icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={mobileLinkClass(path)}
                            onClick={chiudiMenu}
                        >
                            <span>{label}</span>
                            {icon}
                        </Link>
                    ))}

                    {/* Profilo + logout */}
                    <div className="border-t border-green-700 mt-2 pt-3 px-4 flex items-center
                                    justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-green-100">
                                {utente?.nome} {utente?.cognome}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                              ${ruoloBadge[utente?.ruolo ?? 'USER']}`}>
                                {utente?.ruolo}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            aria-label="Logout"
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-400
                                       px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}