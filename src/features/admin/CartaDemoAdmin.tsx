//! Admin management of the demo menu (same localStorage store the public
//! carta uses): table with photos, full CRUD and reset to seed.

import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import {
  Button, Card, money, Pill, ReasonModal, Table, useData, useToast,
} from "../../ui/kit";
import DishForm, { draftFrom, emptyDraft, type DishDraft } from "../public/DishForm";
import {
  addDish, listDishes, removeDish, resetDishes, updateDish, type Dish,
} from "../public/cartaStore";

export default function CartaDemoAdmin() {
  const toast = useToast();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formInitial, setFormInitial] = useState<DishDraft>(emptyDraft());
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  // Exists to confirm the session is authenticated before showing local data.
  const me = useData<{ display_name: string }>(["auth", "me"], "/auth/me");

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
    toast("Plato guardado en la carta demo", true);
    refresh();
  };

  return (
    <div className="space-y-4">
      <Card
        title={`Carta demo (${dishes.length} platos · datos locales del navegador)`}
        actions={
          <div className="flex gap-2">
            <Button kind="ghost" onClick={() => { resetDishes(); refresh(); toast("Demo restaurada", true); }}>
              <span className="inline-flex items-center gap-1.5"><RotateCcw size={13} /> Restaurar demo</span>
            </Button>
            <Button onClick={() => {
              setEditId(null);
              setFormTitle("Nuevo plato");
              setFormInitial(emptyDraft());
              setFormOpen(true);
            }}>
              <span className="inline-flex items-center gap-1.5"><Plus size={13} /> Nuevo plato</span>
            </Button>
          </div>
        }
      >
        {me.error && <p className="mb-2 text-xs text-red-300">{String(me.error)}</p>}
        <Table
          head={["Foto", "Plato", "Categoría", "Etiqueta", "Precio", "Acciones"]}
          rows={dishes.map((dish) => [
            dish.photo
              ? <img key="p" src={dish.photo} alt="" className="h-10 w-14 rounded-md border border-ink-line object-cover" />
              : <span key="p" className="text-ink-mut">—</span>,
            <div key="n">
              <b>{dish.name}</b>
              <p className="max-w-xs truncate text-xs text-ink-mut">{dish.description}</p>
            </div>,
            dish.category,
            dish.tag ? <Pill key="t" value={dish.tag} /> : "—",
            money(dish.price),
            <div key="a" className="flex gap-1.5">
              <Button kind="ghost" onClick={() => {
                setEditId(dish.id);
                setFormTitle(`Editar · ${dish.name}`);
                setFormInitial(draftFrom(dish));
                setFormOpen(true);
              }}>
                Editar
              </Button>
              <Button kind="danger" onClick={() => setDeleteTarget(dish)}>Borrar</Button>
            </div>,
          ])}
        />
      </Card>

      <DishForm
        open={formOpen}
        initial={formInitial}
        title={formTitle}
        onClose={() => setFormOpen(false)}
        onSubmit={submitDish}
      />

      <ReasonModal
        open={deleteTarget !== null}
        title="Borrar plato de la demo"
        label={`Confirma borrando "${deleteTarget?.name ?? ""}" — escribe la razón`}
        onClose={() => setDeleteTarget(null)}
        onSubmit={() => {
          if (deleteTarget) {
            removeDish(deleteTarget.id);
            refresh();
            toast("Plato borrado", true);
          }
        }}
      />
    </div>
  );
}
