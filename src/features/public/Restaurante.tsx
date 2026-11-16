//! Editorial restaurant section: big ambience photo, dish gallery strip and
//! fine-ruled KPIs. Surfaces unfold from their edges with a light band as
//! they enter the viewport (see `edgeClass` / `.sweep` in index.css).

import useReveal, { edgeClass } from "./useReveal";

// Stock imagery (editable; swap for the real restaurant's photos later).
const AMBIENCE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=70";
const GALLERY = [
  { src: "https://images.unsplash.com/photo-1585032226651-759b368ef7cf?auto=format&fit=crop&w=700&q=60", alt: "Plato de la casa" },
  { src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=60", alt: "Cocina en acción" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=60", alt: "Servicio en mesa" },
];

const KPIS = [
  { value: "12 años", label: "de oficio en cocina" },
  { value: "40+", label: "platos en carta viva" },
  { value: "100%", label: "trazabilidad de insumos" },
];

export default function Restaurante() {
  const main = useReveal();
  const gallery = useReveal();
  const kpis = useReveal();

  return (
    <section id="restaurante" className="relative scroll-mt-16 bg-sand-950 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* ── Editorial two-column block ─────────────────────────────── */}
        <div ref={main.ref} className={`grid items-center gap-10 md:grid-cols-2 md:gap-14 ${edgeClass(main.revealed)}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              El restaurante
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-sand-txt sm:text-4xl md:text-5xl">
              Cocina de barrio,
              <br />
              <span className="text-sand-mut">oficio de siempre</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-sand-mut sm:text-base">
              En MixGustos cocinamos lo que se sirve en una casa: platos de
              temporada, insumos de proveedores locales y una carta que cambia
              cuando cambia el mercado. Detrás de cada plato hay un productor
              y una historia — y puedes probarla hoy.
            </p>
            <a
              href="#carta"
              className="link-underline mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-500"
            >
              Descubre la carta →
            </a>
          </div>
          <div className="relative">
            <div className="sweep overflow-hidden rounded-3xl border border-sand-line/60 shadow-2xl">
              <img
                src={AMBIENCE}
                alt="Ambiente del restaurante"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="liquid-glass absolute -bottom-5 left-6 rounded-2xl px-5 py-3 sm:left-10">
              <p className="text-sm font-semibold text-white">Miraflores, Lima</p>
              <p className="text-xs text-white/70">Cocina abierta de martes a domingo</p>
            </div>
          </div>
        </div>

        {/* ── Gallery strip ──────────────────────────────────────────── */}
        <div ref={gallery.ref} className="mt-16 grid gap-4 sm:grid-cols-3 md:mt-24">
          {GALLERY.map((photo, index) => (
            <div
              key={photo.src}
              className={`sweep group overflow-hidden rounded-2xl border border-sand-line/50 ${edgeClass(gallery.revealed, index * 110)}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          ))}
        </div>

        {/* ── KPIs with fine rules ───────────────────────────────────── */}
        <div
          ref={kpis.ref}
          className={`mt-14 grid gap-px overflow-hidden rounded-2xl border border-sand-line/50 bg-sand-line/50 sm:grid-cols-3 md:mt-20 ${edgeClass(kpis.revealed)}`}
        >
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="bg-sand-900 px-6 py-8 text-center">
              <p className="text-3xl font-semibold tracking-tight text-brand-500 sm:text-4xl">{kpi.value}</p>
              <p className="mt-2 text-xs text-sand-mut sm:text-sm">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
