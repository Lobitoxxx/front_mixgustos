//! Public landing: hero fullscreen, restaurant info, carta showcase and
//! contact. The first visit is gated by the cookie consent panel; the staff
//! login deploys as a modal over the page (closable with ✕ or Escape).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { experienciaInicial } from "../../nav/config";
import LandingNav from "./LandingNav";
import Hero from "./Hero";
import Restaurante from "./Restaurante";
import CartaDemo from "./CartaDemo";
import { Contacto } from "./Secciones";
import ConsentGate, { readConsent } from "./ConsentGate";
import LoginForm from "./LoginForm";
import RegisterFlow from "./RegisterFlow";
import Terms from "./Terms";
import type { Me } from "../../auth/AuthContext";

type Overlay = null | "login" | "register" | "terms";

export default function Landing() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [gate, setGate] = useState(() => readConsent() === null);
  const navigate = useNavigate();

  // Escape closes whatever overlay is open.
  useEffect(() => {
    if (!overlay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay]);

  const enterSystem = (me: Me) => navigate(`/${experienciaInicial(me.permissions)}`, { replace: true });

  return (
    <div className="min-h-screen bg-sand-950 text-sand-txt">
      <Hero onLogin={() => setOverlay("login")} nav={<LandingNav onLogin={() => setOverlay("login")} />} />
      <Restaurante />
      <CartaDemo />
      <Contacto onOpenTerms={() => setOverlay("terms")} />

      {gate && (
        <ConsentGate
          onOpenPolicy={() => setOverlay("terms")}
          onDecided={() => setGate(false)}
        />
      )}

      {/* ── Login overlay ─────────────────────────────────────────────── */}
      {overlay === "login" && (
        <div
          className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay(null)}
        >
          <div
            className="glass-card animate-pop w-full max-w-sm rounded-2xl bg-ink-800/90 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setOverlay(null)}
                className="press rounded-lg border border-white/10 p-1.5 text-ink-mut hover:border-white/25 hover:text-ink-txt"
                aria-label="Cerrar y volver a la página"
              >
                ✕
              </button>
            </div>
            <LoginForm onSuccess={enterSystem} />
            <button
              onClick={() => setOverlay("register")}
              className="mt-4 w-full text-center text-xs text-brand-500 hover:underline"
            >
              ¿Nuevo por aquí? Crea tu cuenta de cliente →
            </button>
          </div>
        </div>
      )}

      {/* ── Client register overlay ───────────────────────────────────── */}
      {overlay === "register" && (
        <div
          className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay(null)}
        >
          <div
            className="glass-card animate-pop max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-ink-800/90 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink-txt">Crear cuenta de cliente</h3>
              <button
                onClick={() => setOverlay(null)}
                className="press rounded-lg border border-white/10 p-1.5 text-ink-mut hover:border-white/25 hover:text-ink-txt"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <RegisterFlow onDone={() => setOverlay(null)} />
          </div>
        </div>
      )}

      {/* ── Terms overlay ─────────────────────────────────────────────── */}
      {overlay === "terms" && (
        <div
          className="animate-fade fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay(null)}
        >
          <div
            className="glass-card animate-pop max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-sand-900/90 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-sand-txt">Términos y condiciones</h3>
              <button
                onClick={() => setOverlay(null)}
                className="press rounded-lg border border-white/10 p-1.5 text-sand-mut hover:border-white/25 hover:text-sand-txt"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <Terms />
          </div>
        </div>
      )}
    </div>
  );
}
