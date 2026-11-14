//! Route table: one lazy scope per experience (A, B, D). The client portal
//! (C) is deferred until the architect answers the anonymous-portal design.

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequirePermiso } from "./app/guards";
import { AdminShell, OpShell, KitchenShell } from "./app/shells";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";

const Resumen = lazy(() => import("./pages/Resumen"));
const Salon = lazy(() => import("./features/op/Salon"));
const Pos = lazy(() => import("./features/op/Pos"));
const Recepcion = lazy(() => import("./features/op/Recepcion"));
const Cola = lazy(() => import("./features/kitchen/Cola"));
const Despacho = lazy(() => import("./features/kitchen/Despacho"));
const Recetas = lazy(() => import("./features/kitchen/Recetas"));
const Productos = lazy(() => import("./features/admin/Productos"));
const Compras = lazy(() => import("./features/admin/Compras"));
const Inventario = lazy(() => import("./features/admin/Inventario"));
const Produccion = lazy(() => import("./features/admin/Produccion"));
const Ventas = lazy(() => import("./features/admin/Ventas"));
const Caja = lazy(() => import("./features/admin/Caja"));
const Personal = lazy(() => import("./features/admin/Personal"));
const Horarios = lazy(() => import("./features/admin/Horarios"));
const Finanzas = lazy(() => import("./features/admin/Finanzas"));
const Reportes = lazy(() => import("./features/admin/Reportes"));
const Notificaciones = lazy(() => import("./features/admin/Notificaciones"));
const Configuracion = lazy(() => import("./features/admin/Configuracion"));

function Cargando() {
  return <p className="p-5 text-ink-mut">Cargando módulo…</p>;
}

function pagina(element: React.ReactNode, perm: string | null) {
  return <RequirePermiso code={perm}>{element}</RequirePermiso>;
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
          <Route path="productos" element={pagina(<Productos />, "products.view")} />
          <Route path="compras" element={pagina(<Compras />, "purchasing.view")} />
          <Route path="inventario" element={pagina(<Inventario />, "inventory.view")} />
          <Route path="produccion" element={pagina(<Produccion />, "production.view")} />
          <Route path="ventas" element={pagina(<Ventas />, "sales.view")} />
          <Route path="caja" element={pagina(<Caja />, "cash.view")} />
          <Route path="personal" element={pagina(<Personal />, "staff.view")} />
          <Route path="horarios" element={pagina(<Horarios />, "schedules.view")} />
          <Route path="finanzas" element={pagina(<Finanzas />, "finance.view")} />
          <Route path="reportes" element={pagina(<Reportes />, "reports.view")} />
          <Route path="notificaciones" element={pagina(<Notificaciones />, null)} />
          <Route path="configuracion" element={pagina(<Configuracion />, "settings.manage")} />
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
          <Route path="salon" element={pagina(<Salon />, "tables.view")} />
          <Route path="pos" element={pagina(<Pos />, "sales.create")} />
          <Route path="recepcion" element={pagina(<Recepcion />, "inventory.receive")} />
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
          <Route path="cola" element={pagina(<Cola />, "orders.view")} />
          <Route path="despacho" element={pagina(<Despacho />, "dispatch.view")} />
          <Route path="recetas" element={pagina(<Recetas />, "recipes.view")} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
