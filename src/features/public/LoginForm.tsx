//! Shared login form used by both the dedicated /login route and the modal
//! that opens over the public landing. Credentials come pre-filled only as a
//! development aid for the seeded owner account; remove before production.

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth, isBadCredentials, type Me } from "../../auth/AuthContext";

export default function LoginForm({ onSuccess }: { onSuccess?: (me: Me) => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("propietario@mixgustos.local");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const me = await login(email.trim(), password);
      onSuccess?.(me);
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
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center">
        <p className="text-xl font-semibold tracking-tight">Iniciar sesión</p>
        <p className="mt-1 text-xs text-ink-mut">Accede al sistema de gestión</p>
      </div>

      <label className="block text-sm">
        <span className="text-ink-mut">Correo</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass-input mt-1 w-full rounded-lg px-3 py-2 text-ink-txt"
        />
      </label>

      <label className="block text-sm">
        <span className="text-ink-mut">Contraseña</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="glass-input mt-1 w-full rounded-lg px-3 py-2 text-ink-txt"
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
        className="w-full rounded-full bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center text-xs text-ink-mut">
        ¿Cliente? El registro del portal de clientes estará disponible próximamente.
      </p>
    </form>
  );
}
