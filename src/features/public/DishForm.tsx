//! Create/edit dish modal for the demo menu (shared by the public carta and
//! the admin page). Photo is a stock URL with a graceful fallback preview.

import { useEffect, useState } from "react";
import { CATEGORIES, type Dish } from "./cartaStore";
import { Modal, Field, Input, Select, Button } from "../../ui/kit";

export interface DishDraft {
  name: string;
  description: string;
  price: string;
  category: string;
  tag: string;
  photo: string;
}

export const emptyDraft = (): DishDraft => ({
  name: "", description: "", price: "", category: CATEGORIES[0], tag: "", photo: "",
});

export const draftFrom = (dish: Dish): DishDraft => ({
  name: dish.name, description: dish.description, price: String(dish.price),
  category: dish.category, tag: dish.tag ?? "", photo: dish.photo,
});

export default function DishForm({
  open, initial, title, onClose, onSubmit,
}: {
  open: boolean;
  initial: DishDraft;
  title: string;
  onClose: () => void;
  onSubmit: (draft: DishDraft) => void;
}) {
  const [draft, setDraft] = useState<DishDraft>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  const set = (key: keyof DishDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const valid = draft.name.trim().length >= 3 && draft.description.trim().length >= 8 && Number(draft.price) > 0;

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nombre">
          <Input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej. Lomo saltado" />
        </Field>
        <Field label="Descripción">
          <Input value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Ingredientes y preparación" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio (S/)">
            <Input type="number" min="0" step="0.5" value={draft.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Categoría">
            <Select value={draft.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Etiqueta (opcional)">
            <Input value={draft.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Ej. estrella, favorito" />
          </Field>
          <Field label="URL de foto">
            <Input value={draft.photo} onChange={(e) => set("photo", e.target.value)} placeholder="https://…" />
          </Field>
        </div>
        {draft.photo && (
          <img
            src={draft.photo}
            alt="Vista previa"
            className="h-28 w-full rounded-lg border border-ink-line object-cover"
            onError={(event) => { (event.target as HTMLImageElement).style.opacity = "0.25"; }}
          />
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button kind="ghost" onClick={onClose}>Cancelar</Button>
        <Button disabled={!valid} onClick={() => onSubmit(draft)}>Guardar plato</Button>
      </div>
    </Modal>
  );
}
