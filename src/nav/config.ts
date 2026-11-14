//! Permission-driven navigation. Every entry declares the backend permission
//! that gates it, so the menu is a projection of /auth/me — never a role name
//! lookup (§7.1: hiding menus is not authorization).

export type Experiencia = "admin" | "op" | "kitchen";

export interface NavEntry {
  label: string;
  path: string;
  /** Backend permission code; null = available to any authenticated user. */
  perm: string | null;
  /** Planned scope: F2 (operativa), F3 (administrativa). */
  fase: 2 | 3;
  /** One-line description shown on the module placeholder. */
  desc: string;
}

export const NAV: Record<Experiencia, NavEntry[]> = {
  admin: [
    { label: "Resumen", path: "/admin", perm: null, fase: 3, desc: "KPIs del día, alertas abiertas y accesos rápidos." },
    { label: "Catálogo", path: "/admin/productos", perm: "products.view", fase: 3, desc: "Productos, categorías, carta y precios históricos." },
    { label: "Proveedores y compras", path: "/admin/compras", perm: "purchasing.view", fase: 3, desc: "Proveedores, órdenes de compra, facturas y cuentas por pagar." },
    { label: "Inventario", path: "/admin/inventario", perm: "inventory.view", fase: 3, desc: "Lotes, vencimientos, movimientos, conteos y valorización." },
    { label: "Producción y recetas", path: "/admin/produccion", perm: "production.view", fase: 3, desc: "Recetas, fichas técnicas, producción y mermas." },
    { label: "Ventas", path: "/admin/ventas", perm: "sales.view", fase: 3, desc: "Ventas consolidadas, pagos y anulaciones." },
    { label: "Caja", path: "/admin/caja", perm: "cash.view", fase: 3, desc: "Registros, sesiones, arqueos y movimientos." },
    { label: "Personal", path: "/admin/personal", perm: "staff.view", fase: 3, desc: "Empleados, documentos e incidencias." },
    { label: "Horarios", path: "/admin/horarios", perm: "schedules.view", fase: 3, desc: "Turnos, horarios y marcas de asistencia." },
    { label: "Finanzas", path: "/admin/finanzas", perm: "finance.view", fase: 3, desc: "Gastos, cuentas por pagar y cuentas por cobrar." },
    { label: "Reportes", path: "/admin/reportes", perm: "reports.view", fase: 3, desc: "Reportes del negocio; financieros si el permiso lo permite." },
    { label: "Notificaciones", path: "/admin/notificaciones", perm: null, fase: 3, desc: "Bandeja, difusión al personal y preferencias." },
    { label: "Configuración", path: "/admin/configuracion", perm: "settings.manage", fase: 3, desc: "Configuración general del sistema." },
  ],
  op: [
    { label: "Mesas y salón", path: "/op/salon", perm: "tables.view", fase: 2, desc: "Mapa de mesas por área, asignación y estados." },
    { label: "Punto de venta", path: "/op/pos", perm: "sales.create", fase: 2, desc: "Pedidos por cobrar, venta, cobros y arqueo del turno." },
    { label: "Recepción", path: "/op/recepcion", perm: "inventory.receive", fase: 2, desc: "Recepción de mercadería desde órdenes de compra; genera lotes." },
  ],
  kitchen: [
    { label: "Cola de cocina", path: "/kitchen/cola", perm: "production.view", fase: 2, desc: "Pedidos en vivo: enviados → en preparación → listos." },
    { label: "Despacho", path: "/kitchen/despacho", perm: "dispatch.view", fase: 2, desc: "Llevar/web: verificar → empacar → listo → entregar; incidencias." },
    { label: "Recetas", path: "/kitchen/recetas", perm: "recipes.view", fase: 2, desc: "Recetas versionadas y fichas técnicas." },
  ],
};

/** Which experience a user should land on, by their permission codes. */
export function experienciaInicial(permisos: string[]): Experiencia {
  const kitchenPerms = ["production.view", "dispatch.view"];
  const opPerms = ["tables.view", "sales.create", "inventory.receive"];
  if (kitchenPerms.some((p) => permisos.includes(p)) && permisos.length <= 8) return "kitchen";
  if (opPerms.some((p) => permisos.includes(p)) && permisos.length <= 12) return "op";
  return "admin";
}
