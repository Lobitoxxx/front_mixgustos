//! Cookie consent gate: the first visit is blocked behind a glass consent
//! panel until the visitor accepts or rejects. The decision persists in
//! localStorage ("mg_cookie_consent": "accepted" | "rejected") and the gate
//! never reappears once chosen.

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const KEY = "mg_cookie_consent";

export function readConsent(): "accepted" | "rejected" | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: "accepted" | "rejected") {
  try { localStorage.setItem(KEY, value); } catch { /* storage may be blocked */ }
}

export default function ConsentGate({ onOpenPolicy, onDecided }: {
  onOpenPolicy: () => void;
  onDecided: () => void;
}) {
  const [detail, setDetail] = useState(false);

  // Lock the page underneath while the gate is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    writeConsent(value);
    onDecided();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="glass-card animate-pop w-full max-w-md rounded-3xl bg-sand-900/95 p-6 shadow-2xl sm:p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-brand-500">
          <Cookie size={22} />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-sand-txt">
          Antes de entrar, tus cookies
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-sand-mut">
          Usamos cookies para recordar tus preferencias y entender cómo
          visitas el sitio. Elige qué permites — puedes cambiar tu decisión
          cuando quieras desde el pie de página.
        </p>
        {detail && (
          <ul className="glass-card mt-4 space-y-2 rounded-2xl p-4 text-xs text-sand-mut">
            <li><b className="text-sand-txt">Esenciales</b> — sesión y seguridad (siempre activas).</li>
            <li><b className="text-sand-txt">Preferencias</b> — idioma, carta favorita, tema.</li>
            <li><b className="text-sand-txt">Analítica</b> — estadísticas anónimas de uso.</li>
          </ul>
        )}
        <button onClick={() => setDetail((d) => !d)} className="mt-3 text-xs font-medium text-brand-500 hover:underline">
          {detail ? "Ver menos" : "¿Qué cookies usamos?"}
        </button>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onOpenPolicy}
            className="link-underline press text-xs font-medium text-sand-mut hover:text-sand-txt sm:mr-auto"
          >
            Leer la política completa
          </button>
          <button
            onClick={() => decide("rejected")}
            className="press rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-sand-mut hover:border-white/30 hover:text-sand-txt"
          >
            Solo esenciales
          </button>
          <button
            onClick={() => decide("accepted")}
            className="press rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-700/30 hover:bg-brand-700"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
