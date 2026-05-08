import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, Leaf } from 'lucide-react';

export default function LoginPage() {
    const { login, errore, clearErrore } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center px-4
                        bg-gradient-to-br from-teal-50 via-teal-100 to-green-100">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg !p-5">

                {/* Intestazione */}
                <div className="mb-5 text-center">
                    <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-green-800">
                        <Leaf className="w-6 h-6" />
                        Wellness Tracker
                    </h1>
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
                            <User className="w-4 h-4 shrink-0 text-gray-400" />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); clearErrore(); }}
                                placeholder="Inserisci username"
                                required
                                autoFocus
                                className="flex-1 text-sm outline-none bg-transparent"
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
                            <Lock className="w-4 h-4 shrink-0 text-gray-400" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearErrore(); }}
                                placeholder="Inserisci password"
                                required
                                className="flex-1 text-sm outline-none bg-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                                className="cursor-pointer text-gray-400 hover:text-green-700 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
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