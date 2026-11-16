//! Demo carta showcase with a discreet edit mode: when on, every dish gains
//! edit/delete buttons and each category gains an "add" action. All changes
//! go to the shared localStorage store and persist across reloads.

import { useCallback, useEffect, useState } from "react";
import { Flame, Pencil, Plus, RotateCcw, Trash2, UtensilsCrossed, Soup, CakeSlice, CupSoda, Leaf } from "lucide-react";
import useReveal, { edgeClass } from "./useReveal";
import DishForm, { draftFrom, emptyDraft, type DishDraft } from "./DishForm";
import {
  addDish, listDishes, removeDish, resetDishes, updateDish, type Dish,
} from "./cartaStore";
import { ReasonModal } from "../../ui/kit";

const CATEGORY_ICON: Record<string, typeof Soup> = {
  "Entradas": Soup,
  "Platos de fondo": UtensilsCrossed,
  "Postres": CakeSlice,
  "Bebidas": CupSoda,
};

const TAG_STYLE: Record<string, string> = {
  "de la casa": "bg-emerald-500/15 text-emerald-300",
  favorito: "bg-amber-500/15 text-amber-300",
  estrella: "bg-brand-500/20 text-brand-500",
  premium: "bg-violet-500/15 text-violet-300",
};

function DishPhoto({ dish }: { dish: Dish }) {
  const [failed, setFailed] = useState(false);
  if (failed || !dish.photo) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-sand-800 to-sand-950">
        <span className="text-3xl font-semibold text-sand-mut/50">{dish.name.charAt(0)}</span>
      </div>
    );
  }
  return (
    <img
      src={dish.photo}
      alt={dish.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

export default function CartaDemo() {
  const [editing, setEditing] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [active, setActive] = useState<string>("Platos de fondo");
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formInitial, setFormInitial] = useState<DishDraft>(emptyDraft());
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  const refresh = useCallback(() => setDishes(listDishes()), []);

  useEffect(refresh, [refresh]);

  const submitDish = (draft: DishDraft) => {
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      category: draft.category,
      tag: draft.tag.trim() || undefined,
      photo: draft.photo.trim(),
    };
    if (editId) updateDish(editId, payload);
    else addDish(payload);
    setFormOpen(false);
    refresh();
  };

  const head = useReveal();
  const grid = useReveal();
  const cards = useReveal();

  const visible = dishes.filter((dish) => dish.category === active);

  return (
    <section id="carta" className="relative scroll-mt-16 bg-sand-950 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* ── Head with the edit-mode switch ─────────────────────────── */}
        <div ref={head.ref} className={`flex flex-wrap items-end justify-between gap-4 ${edgeClass(head.revealed)}`}>
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              <Flame size={14} /> Así verá tu carta
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-sand-txt sm:text-4xl md:text-5xl">
              Una carta digital que se actualiza sola
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-sand-mut sm:text-base">
              Los precios, la disponibilidad y los platos del día nacen del
              mismo sistema que gestiona la cocina. Este es un ejemplo editable
              — <b className="text-sand-txt">modo edición</b> para crear,
              modificar o borrar platos; los cambios quedan guardados en este
              navegador.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editing && (
              <button
                onClick={() => { resetDishes(); refresh(); }}
                className="flex items-center gap-1.5 rounded-full border border-sand-line px-4 py-2 text-xs font-medium text-sand-mut hover:text-sand-txt"
              >
                <RotateCcw size={13} /> Restaurar demo
              </button>
            )}
            <button
              onClick={() => setEditing((value) => !value)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-300 ${
                editing
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-sand-line text-sand-mut hover:border-sand-mut hover:text-sand-txt"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${editing ? "bg-white" : "bg-sand-mut"}`} />
              Modo edición {editing ? "activo" : ""}
            </button>
          </div>
        </div>

        {/* ── Category tabs ──────────────────────────────────────────── */}
        <div ref={grid.ref} className={`mt-10 flex flex-wrap items-center gap-2 ${edgeClass(grid.revealed, 120)}`}>
          {[...new Set(dishes.map((dish) => dish.category))].map((category) => {
            const Icon = CATEGORY_ICON[category] ?? UtensilsCrossed;
            return (
              <button
                key={category}
                onClick={() => setActive(category)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === category
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-sand-line text-sand-mut hover:border-sand-mut hover:text-sand-txt"
                }`}
              >
                <Icon size={15} />
                {category}
              </button>
            );
          })}
          {editing && (
            <button
              onClick={() => {
                setEditId(null);
                setFormTitle(`Nuevo plato · ${active}`);
                setFormInitial({ ...emptyDraft(), category: active });
                setFormOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-brand-500/60 px-4 py-2 text-sm font-medium text-brand-500 hover:bg-brand-500/10"
            >
              <Plus size={15} /> Añadir plato
            </button>
          )}
        </div>

        {/* ── Dish cards ─────────────────────────────────────────────── */}
        <div ref={cards.ref} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((dish, index) => (
            <article
              key={dish.id}
              className={`sweep group overflow-hidden rounded-2xl border border-sand-line/60 bg-sand-900 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/60 hover:shadow-xl hover:shadow-black/30 ${edgeClass(cards.revealed, index * 70)}`}
            >
              <div className="relative">
                <DishPhoto dish={dish} />
                {editing && (
                  <div className="absolute right-2 top-2 flex gap-1.5 opacity-90">
                    <button
                      onClick={() => {
                        setEditId(dish.id);
                        setFormTitle(`Editar · ${dish.name}`);
                        setFormInitial(draftFrom(dish));
                        setFormOpen(true);
                      }}
                      className="rounded-lg bg-black/60 p-1.5 text-white/80 backdrop-blur-sm hover:bg-black/80 hover:text-white"
                      aria-label={`Editar ${dish.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dish)}
                      className="rounded-lg bg-black/60 p-1.5 text-red-300 backdrop-blur-sm hover:bg-red-950/80 hover:text-red-200"
                      aria-label={`Borrar ${dish.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {dish.tag && !editing && (
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TAG_STYLE[dish.tag] ?? "bg-black/60 text-white"}`}>
                    {dish.tag}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-sand-txt">{dish.name}</h3>
                  <span className="shrink-0 rounded-lg bg-brand-500/10 px-2 py-0.5 font-semibold text-brand-500">
                    S/ {dish.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-sand-mut">{dish.description}</p>
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-sand-mut">
              No hay platos en esta categoría{editing ? " — usa «Añadir plato»" : ""}.
            </p>
          )}
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs text-sand-mut">
          <Leaf size={13} /> Insumos de temporada y proveedores locales — trazabilidad completa desde el lote hasta el plato.
        </p>
      </div>

      {/* Create / edit modal */}
      <DishForm
        open={formOpen}
        initial={formInitial}
        title={formTitle}
        onClose={() => setFormOpen(false)}
        onSubmit={submitDish}
      />

      {/* Delete confirmation (auditable-style reason modal) */}
      <ReasonModal
        open={deleteTarget !== null}
        title="Borrar plato de la demo"
        label={`Confirma borrando "${deleteTarget?.name ?? ""}" — escribe la razón`}
        onClose={() => setDeleteTarget(null)}
        onSubmit={() => {
          if (deleteTarget) {
            removeDish(deleteTarget.id);
            refresh();
          }
        }}
      />
    </section>
  );
}
