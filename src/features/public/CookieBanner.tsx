//! Cookie consent: global banner on public pages. The decision persists in
//! localStorage ("mg_cookie_consent": "accepted" | "rejected") and the banner
//! never reappears once the visitor has chosen.

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

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState(false);

  useEffect(() => {
    if (readConsent() === null) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const decide = (value: "accepted" | "rejected") => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div className="animate-slide-up fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-sand-line bg-sand-900/95 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <Cookie size={20} className="mt-0.5 shrink-0 text-brand-500" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-sand-txt">Uso de cookies</h3>
          <p className="mt-1 text-xs leading-relaxed text-sand-mut">
            Usamos cookies para mejorar tu experiencia en nuestros dispositivos:
            recordar tus preferencias y entender cómo visitas el sitio.
          </p>
          {detail && (
            <ul className="mt-2 space-y-1 text-xs text-sand-mut">
              <li><b className="text-sand-txt">Esenciales</b> — sesión y seguridad (siempre activas).</li>
              <li><b className="text-sand-txt">Preferencias</b> — idioma, carta favorita, tema.</li>
              <li><b className="text-sand-txt">Analítica</b> — estadísticas anónimas de uso.</li>
            </ul>
          )}
          <button onClick={() => setDetail((d) => !d)} className="mt-2 text-xs text-brand-500 hover:underline">
            {detail ? "Ver menos" : "Configurar"}
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          onClick={() => decide("rejected")}
          className="rounded-full border border-sand-line px-4 py-2 text-xs font-medium text-sand-mut hover:text-sand-txt"
        >
          Rechazar
        </button>
        <button
          onClick={() => decide("accepted")}
          className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Aceptar todas
        </button>
      </div>
    </div>
  );
}
