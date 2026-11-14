//! Public landing: hero fullscreen, restaurant info, carta showcase and
//! contact. The login deploys as a modal over the page; the client register
//! flow (T&C + cookies) is available from the login modal.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { experienciaInicial } from "../../nav/config";
import LandingNav from "./LandingNav";
import Hero from "./Hero";
import Restaurante from "./Restaurante";
import BentoSistema from "./BentoSistema";
import CartaDemo from "./CartaDemo";
import { Contacto } from "./Secciones";
import CookieBanner from "./CookieBanner";
import LoginForm from "./LoginForm";
import RegisterFlow from "./RegisterFlow";
import Terms from "./Terms";
import type { Me } from "../../auth/AuthContext";

type Overlay = null | "login" | "register" | "terms";

export default function Landing() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const navigate = useNavigate();

  const enterSystem = (me: Me) => navigate(`/${experienciaInicial(me.permissions)}`, { replace: true });

  return (
    <div className="min-h-screen bg-sand-950 text-sand-txt">
      <Hero onLogin={() => setOverlay("login")} nav={<LandingNav onLogin={() => setOverlay("login")} />} />
      <Restaurante />
      <CartaDemo />
      <BentoSistema />
      <Contacto onOpenTerms={() => setOverlay("terms")} />
      <CookieBanner />

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
            <button
              onClick={() => setOverlay(null)}
              className="float-right text-ink-mut hover:text-ink-txt"
              aria-label="Cerrar"
            >
              ✕
            </button>
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
              <button onClick={() => setOverlay(null)} className="text-ink-mut hover:text-ink-txt">✕</button>
            </div>
            <RegisterFlow onDone={() => setOverlay(null)} />
          </div>
        </div>
      )}

      {/* ── Terms overlay ─────────────────────────────────────────────── */}
      {overlay === "terms" && (
        <div
          className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay(null)}
        >
          <div
            className="glass-card animate-pop max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-sand-900/90 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-sand-txt">Términos y condiciones</h3>
              <button onClick={() => setOverlay(null)} className="text-sand-mut hover:text-sand-txt">✕</button>
            </div>
            <Terms />
          </div>
        </div>
      )}
    </div>
  );
}
