//! Shared login form used by both the dedicated /login route and the modal
//! that opens over the public landing. Credentials come pre-filled only as a
//! development aid for the seeded owner account; remove before production.

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth, isBadCredentials, type Me } from "../../auth/AuthContext";

export default function LoginForm({ onSuccess }: { onSuccess?: (me: Me) => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** One-click demo access for every seeded role (development aid). */
  const DEMO: { label: string; email: string; password: string }[] = [
    { label: "Propietario", email: "propietario@mixgustos.local", password: "admin1234" },
    { label: "Mesero", email: "mozo@mixgustos.local", password: "demo1234" },
    { label: "Cajero", email: "cajero@mixgustos.local", password: "demo1234" },
    { label: "Cocinero", email: "cocinero@mixgustos.local", password: "demo1234" },
    { label: "Despacho", email: "despachador@mixgustos.local", password: "demo1234" },
    { label: "Almacén", email: "almacenero@mixgustos.local", password: "demo1234" },
    { label: "Contador", email: "contador@mixgustos.local", password: "demo1234" },
    { label: "Admin", email: "administrador@mixgustos.local", password: "demo1234" },
  ];

  const enterAs = async (account: { email: string; password: string }) => {
    setBusy(true);
    setError(null);
    try {
      const me = await login(account.email, account.password);
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await enterAs({ email: email.trim(), password });
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
        className="press w-full rounded-full bg-brand-600 py-2.5 font-semibold text-white shadow-sm shadow-brand-700/30 hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Entrando…" : "Entrar"}
      </button>

      {/* One-click demo roles (remove before production). */}
      <div className="glass-card rounded-2xl p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-mut">
          Entrar como demo
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO.map((account) => (
            <button
              key={account.email}
              type="button"
              disabled={busy}
              onClick={() => enterAs(account)}
              className="press rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-ink-mut transition-colors hover:border-brand-500/60 hover:text-white disabled:opacity-40"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-ink-mut">
        ¿Cliente? El registro del portal de clientes estará disponible próximamente.
      </p>
    </form>
  );
}
