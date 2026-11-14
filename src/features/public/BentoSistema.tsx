//! System section as a bento grid: varied cell sizes, gradient icon capsules,
//! hover elevation, and a highlighted cell with a mini HTML/CSS mockup of the
//! management interface so the product is visible, not just described.

import { ChefHat, ClipboardList, Store, Warehouse, BarChart3, ShieldCheck } from "lucide-react";
import useReveal, { revealClass } from "./useReveal";

const MOCK_ORDERS = [
  { code: "ORD-084", channel: "Salón · M5", status: "En cocina", tone: "text-amber-300 bg-amber-500/15" },
  { code: "ORD-085", channel: "Llevar", status: "Listo", tone: "text-emerald-300 bg-emerald-500/15" },
  { code: "ORD-086", channel: "Delivery", status: "En reparto", tone: "text-sky-300 bg-sky-500/15" },
];

function MiniMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#10151f] shadow-2xl">
      {/* mock top bar */}
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400/70" />
        <span className="h-2 w-2 rounded-full bg-amber-400/70" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-[10px] text-white/40">mixgustos · operación</span>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-[1fr_1.4fr]">
        {/* KPI column */}
        <div className="space-y-2">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
            <p className="text-[10px] text-white/40">Ventas del día</p>
            <p className="text-sm font-semibold text-white">S/ 2,148.50</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
            <p className="text-[10px] text-white/40">Caja · diferencia</p>
            <p className="text-sm font-semibold text-emerald-300">S/ 0.00</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
            <p className="text-[10px] text-white/40">Alertas de stock</p>
            <p className="text-sm font-semibold text-amber-300">3 productos</p>
          </div>
        </div>
        {/* Orders table */}
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
          <p className="mb-2 text-[10px] text-white/40">Pedidos en vivo</p>
          <div className="space-y-1.5">
            {MOCK_ORDERS.map((order) => (
              <div key={order.code} className="flex items-center gap-2 rounded-md bg-white/[0.04] px-2 py-1.5">
                <span className="font-mono text-[10px] text-white/60">{order.code}</span>
                <span className="text-[10px] text-white/40">{order.channel}</span>
                <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium ${order.tone}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CELLS = [
  { icon: Store, title: "Salón y caja", text: "Mesas, pedidos, cobros y arqueo exacto del turno.", tint: "from-orange-500/30 to-brand-600/5" },
  { icon: ChefHat, title: "Cocina y despacho", text: "Colas por estado, empacado y entrega a domicilio.", tint: "from-amber-500/30 to-orange-600/5" },
  { icon: Warehouse, title: "Inventario y compras", text: "Lotes con trazabilidad, merma y alertas de stock.", tint: "from-emerald-500/30 to-emerald-600/5" },
  { icon: ClipboardList, title: "Producción y recetas", text: "Costos reales por plato con recetas versionadas.", tint: "from-sky-500/30 to-sky-600/5" },
  { icon: BarChart3, title: "Reportes y finanzas", text: "Cierre diario con valores reales y estimados.", tint: "from-violet-500/30 to-violet-600/5" },
  { icon: ShieldCheck, title: "Auditoría total", text: "Cada operación queda registrada con autor y motivo.", tint: "from-brand-500/30 to-brand-700/5" },
];

export default function BentoSistema() {
  const head = useReveal();
  const grid = useReveal();

  return (
    <section id="sistema" className="scroll-mt-16 bg-sand-900 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div ref={head.ref} className={`max-w-xl ${revealClass(head.revealed)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            El sistema detrás
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-sand-txt sm:text-4xl md:text-5xl">
            Todo lo que pasa en el local,
            <br />
            <span className="text-sand-mut">bajo control</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sand-mut sm:text-base">
            El personal accede con su cuenta y solo ve lo que su rol permite —
            la seguridad la define el backend, siempre. Esto es lo que opera
            cada día:
          </p>
        </div>

        {/* ── Bento grid ─────────────────────────────────────────────── */}
        <div
          ref={grid.ref}
          className={`mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${revealClass(grid.revealed)}`}
        >
          {/* Highlighted wide cell with the mini mockup */}
          <div className="liquid-glass !overflow-visible rounded-3xl sm:col-span-2 lg:col-span-2">
            <div className="relative grid items-center gap-6 p-6 sm:grid-cols-[1.1fr_1fr] sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Vista en vivo
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  La operación del local, en una pantalla
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  KPIs del día, pedidos en vivo y alertas de stock se actualizan
                  solos. Cada rol ve exactamente lo que necesita — ni más, ni
                  menos.
                </p>
              </div>
              <MiniMockup />
            </div>
          </div>

          {CELLS.map((cell) => (
            <div
              key={cell.title}
              className="group rounded-3xl border border-sand-line/50 bg-sand-800/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:bg-sand-800"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-inner ${cell.tint}`}
              >
                <cell.icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold text-sand-txt">{cell.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-mut">{cell.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
