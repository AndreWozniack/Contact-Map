/**
 * Biblioteca de comunicação com API
 * 
 * Este módulo fornece uma interface simplificada para fazer requisições HTTP
 * para a API backend, incluindo autenticação automática via tokens Bearer.
 */

type Json = Record<string, unknown>;
type ApiError = { message?: string; errors?: Record<string, string[]> };

const API_BASE = '/api';

/**
 * Obtém o token de autenticação armazenado no localStorage
 * 
 * @returns Token de autenticação ou null se não existir
 */
function getToken(): string | null {
    return localStorage.getItem('token');
}

/**
 * Executa uma requisição HTTP para a API
 * 
 * @param path Caminho da API (será prefixado com API_BASE)
 * @param opts Opções da requisição incluindo método, body, headers e configurações de auth
 * @returns Promise com a resposta tipada
 * @throws Erro com detalhes da API em caso de falha
 */
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
        try { 
            detail = await res.json(); 
        } catch {
            // Ignora erros de parsing JSON
        }
        const err = new Error(detail?.message || res.statusText) as Error & { detail?: ApiError };
        err.detail = detail;
        throw err;
    }
    
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

/**
 * API client com métodos HTTP convenientes
 * 
 * Fornece métodos tipados para GET, POST, PUT e DELETE com autenticação automática
 */
export const api = {
    get: <T>(p: string, auth = true) => request<T>(p, { method: 'GET', auth }),
    post: <T>(p: string, json?: Json, auth = true) => request<T>(p, { method: 'POST', json, auth }),
    put:  <T>(p: string, json?: Json, auth = true) => request<T>(p, { method: 'PUT',  json, auth }),
    del:  <T>(p: string, json?: Json, auth = true) => request<T>(p, { method: 'DELETE', json, auth }),
};
