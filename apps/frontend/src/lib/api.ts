type Json = Record<string, unknown>;
type ApiError = { message?: string; errors?: Record<string, string[]> };

const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}

async function request<T>(
    path: string,
    opts: RequestInit & { json?: Json; auth?: boolean } = {}
): Promise<T> {
    const headers = new Headers(opts.headers);
    headers.set('Accept', 'application/json');
    if (opts.json) {
        headers.set('Content-Type', 'application/json');
    }
    if (opts.auth !== false) {
        const t = getToken();
        if (t) headers.set('Authorization', `Bearer ${t}`);
    }

    const res = await fetch(API_BASE + path, {
        method: opts.method ?? (opts.json ? 'POST' : 'GET'),
        body: opts.json ? JSON.stringify(opts.json) : opts.body,
        headers,
        credentials: 'include',
    });

    if (!res.ok) {
        let detail: ApiError | undefined;
        try { detail = await res.json(); } catch {}
        const err = new Error(detail?.message || res.statusText);
        (err as any).detail = detail;
        throw err;
    }
    // 204 no-content?
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const api = {
    get: <T>(p: string, auth = true) => request<T>(p, { method: 'GET', auth }),
    post: <T>(p: string, json?: Json, auth = true) => request<T>(p, { method: 'POST', json, auth }),
    put:  <T>(p: string, json?: Json, auth = true) => request<T>(p, { method: 'PUT',  json, auth }),
    del:  <T>(p: string, json?: Json, auth = true) => request<T>(p, { method: 'DELETE', json, auth }),
};
