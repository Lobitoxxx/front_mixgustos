//! Recipes: list with versions; create recipe; create a new version with
//! ingredients/yields/procedures (chef is the writer, §4.2.4).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Product { id: string; code: string; name: string; unit_id: string; is_ingredient: boolean }
interface Recipe { id: string; product_id: string; name: string; status: string; current_version_id?: string | null }
interface Ingredient { product_id: string; quantity: number; unit_id: string }

export default function Recetas() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [ingredientProduct, setIngredientProduct] = useState("");
  const [ingredientQty, setIngredientQty] = useState("1");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [portions, setPortions] = useState("1");

  const products = useData<Product[]>(["products"], "/products");
  const recipes = useData<Recipe[]>(["recipes"], "/recipes", 15000);
  const versions = useData<{ items: unknown[] } | unknown[]>(
    ["recipe-versions", recipes.data?.[0]?.id],
    recipes.data?.[0] ? `/recipes/${recipes.data[0].id}/versions` : "",
    undefined,
    !!recipes.data?.[0],
  );

  const createRecipe = useAction(
    () => api("/recipes", { method: "POST", body: { product_id: newProduct, name: newName } }),
    { ok: "Receta creada", invalidate: ["recipes"] },
  );
  const createVersion = useAction(
    () => api(`/recipes/${recipes.data?.[0]?.id}/versions`, {
      method: "POST",
      body: {
        notes: "versión desde panel",
        target_portions: Number(portions),
        ingredients,
        yields: [],
        procedures: [],
      },
    }),
    { ok: "Versión creada", invalidate: ["recipes", "recipe-versions"] },
  );

  const productName = (id: string) => (products.data ?? []).find((p) => p.id === id)?.name ?? id.slice(0, 8);
  const versionCount = Array.isArray(versions.data) ? versions.data.length : 0;

  return (
    <div className="space-y-4">
      <Card
        title={`Recetas (${recipes.data?.length ?? 0})`}
        actions={<Button onClick={() => setCreateOpen(true)}>Nueva receta</Button>}
      >
        {recipes.isLoading ? <Loading /> : (
          <Table
            head={["Nombre", "Producto", "Estado"]}
            rows={(recipes.data ?? []).map((recipe) => [
              recipe.name,
              productName(recipe.product_id),
              recipe.status,
            ])}
          />
        )}
      </Card>

      {recipes.data?.[0] && (
        <Card title={`Versiones · ${recipes.data[0].name}`}>
          <p className="mb-3 text-sm text-ink-mut">{versionCount} versión(es) registradas.</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-52">
              <Field label="Insumo">
                <Select
                  value={ingredientProduct}
                  onChange={(e) => {
                    const product = (products.data ?? []).find((p) => p.id === e.target.value);
                    setIngredientProduct(e.target.value);
                    if (product) setIngredients((current) => [
                      ...current.filter((i) => i.product_id !== product.id),
                      { product_id: product.id, quantity: Number(ingredientQty) || 1, unit_id: product.unit_id },
                    ]);
                  }}
                >
                  <option value="">Selecciona…</option>
                  {(products.data ?? []).filter((p) => p.is_ingredient !== false).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-24">
              <Field label="Cantidad"><Input type="number" min="0" step="0.01" value={ingredientQty} onChange={(e) => setIngredientQty(e.target.value)} /></Field>
            </div>
            <div className="w-24">
              <Field label="Porciones"><Input type="number" min="1" value={portions} onChange={(e) => setPortions(e.target.value)} /></Field>
            </div>
            <Button busy={createVersion.isPending} disabled={ingredients.length === 0} onClick={() => createVersion.mutate(undefined)}>
              Crear versión ({ingredients.length} insumos)
            </Button>
          </div>
        </Card>
      )}

      <Modal open={createOpen} title="Nueva receta" onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Pan artesanal" />
          </Field>
          <Field label="Producto de venta asociado">
            <select
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              className="glass-input w-full rounded-md px-3 py-2 text-sm"
            >
              <option value="">Selecciona…</option>
              {(products.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button
            busy={createRecipe.isPending}
            disabled={!newName.trim() || !newProduct}
            onClick={() => createRecipe.mutate(undefined, { onSuccess: () => setCreateOpen(false) })}
          >
            Crear
          </Button>
        </div>
      </Modal>
    </div>
  );
}
