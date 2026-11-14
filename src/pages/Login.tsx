//! Login screen. Credentials come pre-filled only as a development aid for
//! the seeded owner account; production deployments should remove them.

import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isBadCredentials } from "../auth/AuthContext";
import { experienciaInicial } from "../nav/config";

export default function Login() {
  const { status, me, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("propietario@mixgustos.local");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const destination =
    (location.state as { from?: string } | null)?.from ?? (me ? `/${experienciaInicial(me.permissions)}` : "/");

  if (status === "ready") return <Navigate to={destination} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(
        isBadCredentials(e)
          ? "Correo o contraseña incorrectos."
          : e instanceof Error
            ? e.message
            : "Error inesperado.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-ink-900 text-ink-txt">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-ink-line bg-ink-800 p-6"
      >
        <div className="text-center">
          <p className="text-2xl font-bold">🍅 MixGustos</p>
          <p className="mt-1 text-sm text-ink-mut">Inicia sesión para continuar</p>
        </div>

        <label className="block text-sm">
          <span className="text-ink-mut">Correo</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-line bg-ink-900 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>

        <label className="block text-sm">
          <span className="text-ink-mut">Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-line bg-ink-900 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>

        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
