//! Route guards. RequireAuth redirects anonymous visitors to /login;
//! RequirePermiso renders a clear "no access" panel when the session lacks
//! the backend permission the module needs.

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-900 text-ink-mut">
        Cargando sesión…
      </div>
    );
  }
  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RequirePermiso({ code, children }: { code: string | null; children: ReactNode }) {
  const { hasPermission } = useAuth();
  if (code && !hasPermission(code)) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-lg font-semibold">Sin acceso</p>
        <p className="mt-1 text-sm text-ink-mut">
          Tu sesión no tiene el permiso <code className="rounded bg-ink-700 px-1">{code}</code>.
          Pide al administrador que te lo asigne.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
