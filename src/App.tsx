//! Route table: one lazy scope per experience (A, B, D). The client portal
//! (C) is deferred until the architect answers the anonymous-portal design.

import { Component, lazy, Suspense } from "react";
import type { ComponentType, ErrorInfo, ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequirePermiso } from "./app/guards";
import { AdminShell, OpShell, KitchenShell } from "./app/shells";
import Login from "./pages/Login";

/** lazy() with one automatic retry: a transient failure while fetching a
 *  route module (flaky network, stale deploy) used to bubble up and leave a
 *  blank window behind the Suspense fallback. The retry absorbs it; if the
 *  second attempt also fails, the ErrorBoundary below takes over. */
function vista(factory: () => Promise<{ default: ComponentType }>) {
  return lazy(() =>
    factory().catch((error) => {
      console.warn("[mg] módulo falló al cargar, reintentando…", error);
      return factory();
    }),
  );
}

const Landing = vista(() => import("./features/public/Landing"));

const Resumen = vista(() => import("./pages/Resumen"));
const Salon = vista(() => import("./features/op/Salon"));
const Pos = vista(() => import("./features/op/Pos"));
const Recepcion = vista(() => import("./features/op/Recepcion"));
const Cola = vista(() => import("./features/kitchen/Cola"));
const Despacho = vista(() => import("./features/kitchen/Despacho"));
const Recetas = vista(() => import("./features/kitchen/Recetas"));
const Productos = vista(() => import("./features/admin/Productos"));
const Compras = vista(() => import("./features/admin/Compras"));
const Inventario = vista(() => import("./features/admin/Inventario"));
const Produccion = vista(() => import("./features/admin/Produccion"));
const Ventas = vista(() => import("./features/admin/Ventas"));
const Caja = vista(() => import("./features/admin/Caja"));
const Personal = vista(() => import("./features/admin/Personal"));
const Horarios = vista(() => import("./features/admin/Horarios"));
const Finanzas = vista(() => import("./features/admin/Finanzas"));
const Reportes = vista(() => import("./features/admin/Reportes"));
const Notificaciones = vista(() => import("./features/admin/Notificaciones"));
const Configuracion = vista(() => import("./features/admin/Configuracion"));
const CartaDemoAdmin = vista(() => import("./features/admin/CartaDemoAdmin"));

/** Glass skeleton shown while a route module streams in. */
function Cargando() {
  return (
    <div className="space-y-4 p-4 sm:p-6" aria-busy="true">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-white/5" />
      <div className="glass-card h-36 animate-pulse rounded-2xl" />
      <div className="glass-card h-72 animate-pulse rounded-2xl" />
    </div>
  );
}

/** Last-resort boundary: a render error inside any window now shows a glass
 *  card with the reason and a one-click recovery, never a blank screen. */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[mg] la ventana falló al renderizar:", error, info.componentStack);
  }
  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ink-900 p-6 text-ink-txt">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 text-center">
            <h1 className="text-lg font-semibold">La ventana falló al abrirse</h1>
            <p className="mt-2 break-words text-sm text-ink-mut">{error.message}</p>
            <button
              onClick={() => location.reload()}
              className="press mt-5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-700/30 hover:bg-brand-700"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function pagina(element: React.ReactNode, perm: string | null) {
  return <RequirePermiso code={perm}>{element}</RequirePermiso>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Cargando />}>
        <Routes>
        <Route path="/login" element={<Login />} />
        {/* Public restaurant website (experience C groundwork). */}
        <Route path="/" element={<Landing />} />

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
          <Route path="carta-demo" element={pagina(<CartaDemoAdmin />, null)} />
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
    </ErrorBoundary>
  );
}
