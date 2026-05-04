import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogAllenamentoPage from './pages/LogAllenamentoPage';

// PrivateRoute: blocca l'accesso se non loggato o ruolo non consentito
function PrivateRoute({
    children,
    ruoliConsentiti,
}: {
    children: ReactNode;
    ruoliConsentiti?: string[];
}) {
    const { utente, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Caricamento...
            </div>
        );
    }

    if (!utente) return <Navigate to="/login" replace />;

    if (ruoliConsentiti && !ruoliConsentiti.includes(utente.ruolo)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

// Router principale
export default function App() {
    return (
        <Routes>
            {/* Rotta pubblica */}
            <Route path="/login" element={<LoginPage />} />

            {/* Redirect radice */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard — tutti i ruoli */}
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                }
            />

            {/* USER */}
            <Route
                path="/log-allenamento"
                element={
                    <PrivateRoute ruoliConsentiti={['USER']}>
                        <LogAllenamentoPage />
                    </PrivateRoute>
                }
            />

            {/* Prossime route — le aggiungeremo step by step */}
            {/* <Route path="/log-allenamento" element={
        <PrivateRoute ruoliConsentiti={['USER']}><LogAllenamentoPage /></PrivateRoute>
      } /> */}

            {/* Redirect di default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}