import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import DashboardUser from './dashboard/DashboardUser';
import DashboardCoach from './dashboard/DashboardCoach';
import DashboardPsicologo from './dashboard/DashboardPsicologo';

export default function DashboardPage() {
    const { utente } = useAuth();

    const renderDashboard = () => {
        switch (utente?.ruolo) {
            case 'USER':      return <DashboardUser />;
            case 'COACH':     return <DashboardCoach />;
            case 'PSICOLOGO': return <DashboardPsicologo />;
            default:          return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="max-w-5xl mx-auto px-4 py-8">
                {renderDashboard()}
            </main>
        </div>
    );
}