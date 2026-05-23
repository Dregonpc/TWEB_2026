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

    // 204 No Content — nessun corpo da parsare
    if (res.status === 204)
        return undefined as T;

    return res.json();
}