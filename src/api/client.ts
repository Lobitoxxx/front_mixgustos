//! Typed HTTP client for the mixgustos-api. Same origin in dev (Vite proxy)
//! and in production. The opaque session token lives in localStorage.

const TOKEN_KEY = "mg_token";

let token: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(next: string | null): void {
  token = next;
  if (next) localStorage.setItem(TOKEN_KEY, next);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return token;
}

/** Standard API error envelope: { error: { code, message } }. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && token) {
    // Expired or revoked session: forget the token so the next view is the
    // login screen. The caller surfaces a friendly message.
    setToken(null);
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const envelope = payload as { error?: { code?: string; message?: string } } | null;
    const code = envelope?.error?.code ?? `http_${response.status}`;
    const message = envelope?.error?.message ?? response.statusText;
    throw new ApiError(response.status, code, message);
  }

  return payload as T;
}
