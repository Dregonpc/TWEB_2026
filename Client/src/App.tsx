import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

// Placeholder Dashboard
function DashboardPage() {
  const { utente, logout } = useAuth();

  return (
      <div style={{ padding: '2rem' }}>
        <h1>Benvenuto, {utente?.nome}!</h1>
        <p>Ruolo: <strong>{utente?.ruolo}</strong></p>
        <button onClick={async () => { await logout(); window.location.replace('/login'); }}>
          Logout
        </button>
      </div>
  );
}

// PrivateRoute
function PrivateRoute({
                        children,
                        ruoliConsentiti,
                      }: {
  children: ReactNode;
  ruoliConsentiti?: string[];
}) {
  const { utente, loading } = useAuth();

  if (loading) return <div>Caricamento...</div>;
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
        <Route path="/login" element={<LoginPage />} />
        <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}