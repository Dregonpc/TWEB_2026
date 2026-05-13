import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { Ruolo } from './types';
import NavBar from './components/NavBar.tsx'

import LoginPage from './pages/LoginPage';
import DashboardUser from './pages/dashboard/DashboardUser';
import DashboardCoach from './pages/dashboard/DashboardCoach';
import DashboardPsicologo from './pages/dashboard/DashboardPsicologo';
import LogAllenamentoPage from './pages/LogAllenamentoPage';
import SchedePage from './pages/SchedePage';
import LogBenesserePage from './pages/LogBenesserePage';
import DietaPage from './pages/DietaPage';
import SchedeCoachPage from './pages/SchedeCoachPage';
import DieteCoachPage from './pages/DieteCoachPage';
import ListaUtentiCoachPage from './pages/ListaUtentiCoachPage';
import ListaUtentiPsicologoPage from './pages/ListaUtentiPsicologoPage';
import MonitoraUtenteCoachPage from './pages/MonitoraUtenteCoachPage';
import MonitoraUtentePsicologoPage from './pages/MonitoraUtentePsicologoPage';

function ProtectedRoute({
                            children,
                            ruoli,
                        }: {
    children: React.ReactElement;
    ruoli?: Ruolo[];
}) {
    const { utente } = useAuth();
    if (!utente) return <Navigate to="/login" replace />;
    if (ruoli && !ruoli.includes(utente.ruolo)) return <Navigate to="/dashboard" replace />;
    return children;
}

function DashboardRouter() {
    const { utente } = useAuth();
    if (utente?.ruolo === 'COACH') return <DashboardCoach />;
    if (utente?.ruolo === 'PSICOLOGO') return <DashboardPsicologo />;
    return <DashboardUser />;
}

function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="max-w-5xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}

function AppRoutes() {
    const { utente } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={utente ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <PageLayout>
                            <DashboardRouter />
                        </PageLayout>
                    </ProtectedRoute>
                }
            />

            {/* ── USER ─────────────────────────────────────── */}
            <Route path="/allenamento" element={<ProtectedRoute ruoli={['USER']}><LogAllenamentoPage /></ProtectedRoute>} />
            <Route path="/schede"      element={<ProtectedRoute ruoli={['USER']}><SchedePage /></ProtectedRoute>} />
            <Route path="/benessere"   element={<ProtectedRoute ruoli={['USER']}><LogBenesserePage /></ProtectedRoute>} />
            <Route path="/dieta"       element={<ProtectedRoute ruoli={['USER']}><DietaPage /></ProtectedRoute>} />

            {/* ── COACH ────────────────────────────────────── */}
            <Route path="/coach/schede"          element={<ProtectedRoute ruoli={['COACH']}><SchedeCoachPage /></ProtectedRoute>} />
            <Route path="/coach/dieta"           element={<ProtectedRoute ruoli={['COACH']}><DieteCoachPage /></ProtectedRoute>} />
            <Route path="/coach/utenti"          element={<ProtectedRoute ruoli={['COACH']}><ListaUtentiCoachPage /></ProtectedRoute>} />
            <Route path="/coach/utente/:utenteId" element={<ProtectedRoute ruoli={['COACH']}><MonitoraUtenteCoachPage /></ProtectedRoute>} />

            {/* ── PSICOLOGO ────────────────────────────────── */}
            <Route path="/psicologo/utenti"          element={<ProtectedRoute ruoli={['PSICOLOGO']}><ListaUtentiPsicologoPage /></ProtectedRoute>} />
            <Route path="/psicologo/utente/:utenteId" element={<ProtectedRoute ruoli={['PSICOLOGO']}><MonitoraUtentePsicologoPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}