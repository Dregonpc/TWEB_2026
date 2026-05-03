import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icona utente
const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-gray-400" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

// Icona lucchetto
const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-gray-400" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

export default function LoginPage() {
    const { login, errore } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch {
            // errore già salvato in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #e0f2f1 5%, #b2dfdb 40%, #c8e6c9 80%)' }}>

            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg !p-5">

                {/* Intestazione */}
                <div className="mb-5 text-center">
                    <h1 className="text-2xl font-bold text-green-800">🌿 Wellness Tracker</h1>
                    <p className="text-gray-500 mt-1 text-sm">Accedi al tuo account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Campo Username */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="username" className="text-sm font-semibold text-gray-600">
                            Username
                        </label>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg !px-3 !py-2.5
                                        focus-within:border-green-700 focus-within:ring-1 focus-within:ring-green-700
                                        transition-colors">
                            <IconUser />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Inserisci username"
                                required
                                autoFocus
                                className="flex-1 text-lm outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Campo Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-600">
                            Password
                        </label>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg !px-3 !py-2.5
                                        focus-within:border-green-700 focus-within:ring-1 focus-within:ring-green-700
                                        transition-colors">
                            <IconLock />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Inserisci password"
                                required
                                className="flex-1 text-lm outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Messaggio di errore */}
                    {errore && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg !px-4 !py-2.5">
                            {errore}
                        </div>
                    )}

                    {/* Bottone submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed
                                   text-white font-semibold rounded-lg px-4 py-2.5 text-sm
                                   transition-colors cursor-pointer"
                    >
                        {loading ? 'Accesso in corso...' : 'Accedi'}
                    </button>

                </form>
            </div>

        </div>
    );
}