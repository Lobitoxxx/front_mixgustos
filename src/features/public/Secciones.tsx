//! Restaurant story + system overview sections and the site footer.

import { ChefHat, ClipboardList, Store, Warehouse, BarChart3, ShieldCheck } from "lucide-react";

const SYSTEM_MODULES = [
  { icon: Store, title: "Salón y caja", text: "Mesas, pedidos, cobros y arqueo exacto del turno." },
  { icon: ChefHat, title: "Cocina y despacho", text: "Colas por estado, empacado y entrega a domicilio." },
  { icon: Warehouse, title: "Inventario y compras", text: "Lotes con trazabilidad, merma y alertas de stock." },
  { icon: ClipboardList, title: "Producción y recetas", text: "Costos reales por plato con recetas versionadas." },
  { icon: BarChart3, title: "Reportes y finanzas", text: "Cierre diario con valores reales y estimados." },
  { icon: ShieldCheck, title: "Auditoría", text: "Cada operación queda registrada con autor y motivo." },
];

export function Restaurante() {
  return (
    <section id="restaurante" className="bg-sand-900 px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            El restaurante
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-sand-txt sm:text-3xl md:text-4xl">
            Cocina de barrio, oficio de siempre
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sand-mut sm:text-base">
            En MixGustos cocinamos lo que se sirve en una casa: platos de
            temporada, insumos de proveedores locales y una carta que cambia
            cuando cambia el mercado. Cada lote que entra a la despensa se
            registra; cada plato se sabe cuánto costó realmente.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              ["12 años", "de oficio"],
              ["40+", "platos en carta"],
              ["100%", "trazabilidad"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-sand-line bg-sand-800/60 p-4">
                <dt className="text-lg font-semibold text-brand-500 sm:text-xl">{value}</dt>
                <dd className="mt-1 text-xs text-sand-mut">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="sistema" className="scroll-mt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            El sistema detrás
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-sand-txt sm:text-3xl md:text-4xl">
            Todo lo que pasa en el local, bajo control
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SYSTEM_MODULES.map((module) => (
              <div key={module.title} className="rounded-xl border border-sand-line bg-sand-800/40 p-4">
                <module.icon size={18} className="text-brand-500" />
                <h3 className="mt-2 text-sm font-semibold text-sand-txt">{module.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-sand-mut">{module.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-sand-mut">
            El personal accede con su cuenta y solo ve lo que su rol permite —
            la seguridad la define el backend, siempre.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Contacto({ onOpenTerms }: { onOpenTerms: () => void }) {
  return (
    <footer id="contacto" className="bg-sand-950 px-5 py-12 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-sand-txt">Visítanos</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand-mut">
            Av. Sabores 210, Miraflores
            <br />
            Lima — Perú
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-sand-txt">Horarios</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand-mut">
            Lunes a sábado · 12:00 – 23:00
            <br />
            Domingos · 12:00 – 17:00
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-sand-txt">Contacto</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand-mut">
            (01) 555-0870
            <br />
            hola@mixgustos.pe
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-3 border-t border-sand-line pt-6 text-xs text-sand-mut">
        <span>© {new Date().getFullYear()} MixGustos — Sistema de gestión para restaurantes.</span>
        <span className="flex gap-4">
          <button onClick={onOpenTerms} className="hover:text-sand-txt">Términos y condiciones</button>
          <button onClick={onOpenTerms} className="hover:text-sand-txt">Política de cookies</button>
        </span>
      </div>
    </footer>
  );
}
