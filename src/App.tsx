//! Route table: one lazy scope per experience (A, B, D). The client portal
//! (C) is deferred until the architect answers the anonymous-portal design.

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequirePermiso } from "./app/guards";
import { AdminShell, OpShell, KitchenShell } from "./app/shells";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import { NAV } from "./nav/config";

const Resumen = lazy(() => import("./pages/Resumen"));
const Modulo = lazy(() => import("./pages/Modulo"));

function Cargando() {
  return <p className="p-5 text-ink-mut">Cargando módulo…</p>;
}

/** Wraps a module route with its permission gate. */
function modulo(experiencia: "admin" | "op" | "kitchen", prefix: string, perm: string | null, relPath: string) {
  return (
    <Route
      key={`${prefix}/${relPath}`}
      path={relPath}
      element={
        <RequirePermiso code={perm}>
          <Modulo experiencia={experiencia} />
        </RequirePermiso>
      }
    />
  );
}

export default function App() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Inicio />} />

        {/* A. Aplicación administrativa */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminShell />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<Cargando />}>
                <Resumen />
              </Suspense>
            }
          />
          {NAV.admin
            .filter((entry) => entry.path !== "/admin")
            .map((entry) =>
              modulo("admin", "/admin", entry.perm, entry.path.slice("/admin/".length)),
            )}
        </Route>

        {/* B. Aplicación operativa */}
        <Route
          path="/op"
          element={
            <RequireAuth>
              <OpShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/op/salon" replace />} />
          {NAV.op.map((entry) =>
            modulo("op", "/op", entry.perm, entry.path.slice("/op/".length)),
          )}
        </Route>

        {/* D. Panel de cocina y despacho */}
        <Route
          path="/kitchen"
          element={
            <RequireAuth>
              <KitchenShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/kitchen/cola" replace />} />
          {NAV.kitchen.map((entry) =>
            modulo("kitchen", "/kitchen", entry.perm, entry.path.slice("/kitchen/".length)),
          )}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
