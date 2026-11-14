//! Demo carta showcase: what the client-facing menu will look like. Static
//! realistic data for now — the real carta will read from /menus once the
//! architect defines the public portal (§12 q9).

import { useState } from "react";
import { Leaf, Flame, CupSoda, CakeSlice, Soup, UtensilsCrossed } from "lucide-react";

interface Dish {
  name: string;
  description: string;
  price: number;
  tag?: string;
}

const MENU: { id: string; title: string; icon: typeof Soup; dishes: Dish[] }[] = [
  {
    id: "entradas",
    title: "Entradas",
    icon: Soup,
    dishes: [
      { name: "Causa limeña", description: "Papa amarilla, ají amarillo y palta con camarones al ajillo.", price: 18, tag: "de la casa" },
      { name: "Anticuchos de corazón", description: "Marinados 24 h en ají panca, con choclo y papa dorada.", price: 22 },
      { name: "Tequeños de lomo", description: "Crujientes, con guacamole y crema de rocoto.", price: 16, tag: "favorito" },
    ],
  },
  {
    id: "platos",
    title: "Platos de fondo",
    icon: UtensilsCrossed,
    dishes: [
      { name: "Lomo saltado", description: "Res al wok con cebolla, tomate y papas fritas al instante.", price: 38, tag: "estrella" },
      { name: "Arroz con mariscos", description: "Mariscos frescos del día, culantro y limón de Chulucanas.", price: 42 },
      { name: "Ají de gallina", description: "Crema de ají amarillo y pecanas sobre papa y arroz graneado.", price: 30 },
      { name: "Seco de res", description: "Cilantro molido en mortero, frejoles y yuca dorada.", price: 34 },
    ],
  },
  {
    id: "postres",
    title: "Postres",
    icon: CakeSlice,
    dishes: [
      { name: "Suspiro limeño", description: "Manjar blanco, merengue al punto y portada de licor.", price: 14 },
      { name: "Tres leches de la casa", description: "Esponjoso, con canela y reducción de chicha morada.", price: 15 },
    ],
  },
  {
    id: "bebidas",
    title: "Bebidas",
    icon: CupSoda,
    dishes: [
      { name: "Chicha morada artesanal", description: "Macerada con piña, canela y limón. Jarra 1 L.", price: 12 },
      { name: "Limonada de hierbaluisa", description: "Fresca, con hielo pilé y un toque de jengibre.", price: 10 },
      { name: "Pisco sour", description: "Quebranta, maracuyá o clásico. Coctelería de autor.", price: 20, tag: "premium" },
    ],
  },
];

const TAG_STYLE: Record<string, string> = {
  "de la casa": "bg-emerald-500/15 text-emerald-300",
  favorito: "bg-amber-500/15 text-amber-300",
  estrella: "bg-brand-500/20 text-brand-500",
  premium: "bg-violet-500/15 text-violet-300",
};

export default function CartaDemo() {
  const [active, setActive] = useState("platos");

  return (
    <section id="carta" className="relative bg-sand-950 px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          <Flame size={14} /> Así verá tu carta
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-sand-txt sm:text-3xl md:text-4xl">
          Una carta digital que se actualiza sola
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand-mut sm:text-base">
          Los precios, la disponibilidad y los platos del día nacen del mismo
          sistema que gestiona la cocina: si se agota un insumo, el plato sale
          de la carta al instante. Este es un ejemplo de cómo la verán tus
          clientes.
        </p>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {MENU.map((category) => (
            <button
              key={category.id}
              onClick={() => setActive(category.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                active === category.id
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-sand-line text-sand-mut hover:border-sand-mut hover:text-sand-txt"
              }`}
            >
              <category.icon size={15} />
              {category.title}
            </button>
          ))}
        </div>

        {/* Dishes */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {MENU.find((c) => c.id === active)?.dishes.map((dish) => (
            <article
              key={dish.name}
              className="group rounded-2xl border border-sand-line bg-sand-900 p-5 transition-colors duration-300 hover:border-brand-500/60"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-sand-txt">{dish.name}</h3>
                <span className="shrink-0 font-semibold text-brand-500">
                  S/ {dish.price.toFixed(2)}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-mut">{dish.description}</p>
              {dish.tag && (
                <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TAG_STYLE[dish.tag]}`}>
                  {dish.tag}
                </span>
              )}
            </article>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-sand-mut">
          <Leaf size={13} /> Insumos de temporada y proveedores locales — trazabilidad completa desde el lote hasta el plato.
        </p>
      </div>
    </section>
  );
}
