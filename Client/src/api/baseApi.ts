// url di base
const BASE_URL = 'http://localhost:8080';

// funzione generica
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {

    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include', // manda il cookie di sessione
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!res.ok)
        throw new Error(`HTTP ${res.status}`);

    return res.json();
}