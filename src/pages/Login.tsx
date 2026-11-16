//! Direct /login route: same form the landing modal uses, on a themed
//! background. Keeps the redirect logic to the operator's home experience.

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { experienciaInicial } from "../nav/config";
import LoginForm from "../features/public/LoginForm";
import Logo from "../features/public/Logo";
import RegisterFlow from "../features/public/RegisterFlow";

export default function Login() {
  const { status, me } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");

  const from = (location.state as { from?: string } | null)?.from;

  // Escape takes the visitor back to the public site.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate("/", { replace: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (status === "ready" && !from) return <Navigate to={`/${experienciaInicial(me?.permissions ?? [])}`} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-950 p-4 text-sand-txt">
      <div className="glass-card animate-pop w-full max-w-sm rounded-2xl bg-sand-900/80 p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="press rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-sand-mut hover:border-white/25 hover:text-sand-txt"
            aria-label="Volver a la página principal"
          >
            ← Volver a la web
          </button>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-base font-medium tracking-tight">mixgustos</span>
          </div>
        </div>

        {mode === "login" ? (
          <>
            <LoginForm
              onSuccess={(session) =>
                navigate(from ?? `/${experienciaInicial(session.permissions)}`, { replace: true })
              }
            />
            <button
              onClick={() => setMode("register")}
              className="mt-4 w-full text-center text-xs text-brand-500 hover:underline"
            >
              ¿Nuevo por aquí? Crea tu cuenta de cliente →
            </button>
          </>
        ) : (
          <>
            <RegisterFlow onDone={() => setMode("login")} />
            <button
              onClick={() => setMode("login")}
              className="mt-4 w-full text-center text-xs text-brand-500 hover:underline"
            >
              ← Volver a iniciar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
