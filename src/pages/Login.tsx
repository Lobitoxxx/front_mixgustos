//! Direct /login route: same form the landing modal uses, on a themed
//! background. Keeps the redirect logic to the operator's home experience.

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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

  const destination =
    (location.state as { from?: string } | null)?.from ?? (me ? `/${experienciaInicial(me.permissions)}` : "/");

  if (status === "ready") return <Navigate to={destination} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-950 p-4 text-sand-txt">
      <div className="w-full max-w-sm rounded-2xl border border-sand-line bg-sand-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-center justify-center gap-2">
          <Logo size={26} />
          <span className="text-lg font-medium tracking-tight">mixgustos</span>
        </div>

        {mode === "login" ? (
          <>
            <LoginForm onSuccess={() => navigate(destination, { replace: true })} />
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
