//! Producción: batches from recipe versions (start reserves stock), output,
//! waste and confirm/cancel; estimated costing per version.

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, Pill, Select,
  Table, useAction, useData,
} from "../../ui/kit";

interface Product { id: string; code: string; name: string; unit_id: string }
interface Recipe { id: string; name: string; current_version_id?: string | null; status: string }
interface Batch {
  id: string; recipe_version_id: string; status: string;
  quantity_produced?: number; started_at?: string;
}

export default function Produccion() {
  const [startOpen, setStartOpen] = useState(false);
  const [outputFor, setOutputFor] = useState<string | null>(null);
  const [versionId, setVersionId] = useState("");

  const [wasteProduct, setWasteProduct] = useState("");
  const [wasteQty, setWasteQty] = useState("");

  const recipes = useData<Recipe[]>(["recipes"], "/recipes", 15000);
  const batches = useData<Batch[]>(["production", "batches"], "/production/batches", 10000);
  const products = useData<Product[]>(["products"], "/products");

  const startBatch = useAction(
    () => api("/production/batches", {
      method: "POST",
      body: { recipe_version_id: versionId, notes: "desde panel" },
    }),
    { ok: "Lote iniciado (reservas creadas)", invalidate: ["production", "inventory"] },
  );
  const output = useAction(
    (args: { batchId: string; productId: string; unitId: string; qty: string }) =>
      api(`/production/batches/${args.batchId}/output`, {
        method: "POST",
        body: { product_id: args.productId, quantity_produced: Number(args.qty), unit_id: args.unitId, portions: 1 },
      }),
    { ok: "Producción registrada", invalidate: ["production", "inventory"] },
  );
  const confirmBatch = useAction(
    (id: string) => api(`/production/batches/${id}/confirm`, { method: "POST" }),
    { ok: "Lote confirmado (consumo real aplicado)", invalidate: ["production", "inventory"] },
  );
  const cancelBatch = useAction(
    (id: string) => api(`/production/batches/${id}/cancel`, { method: "POST" }),
    { ok: "Lote cancelado", invalidate: ["production", "inventory"] },
  );

  const versionLabel = (id: string) => {
    const recipe = (recipes.data ?? []).find((candidate) => candidate.current_version_id === id);
    return recipe ? `${recipe.name} · v` : id.slice(0, 8);
  };

  return (
    <div className="space-y-4">
      <Card title="Recetas vigentes">
        {recipes.isLoading ? <Loading /> : (
          <Table
            head={["Receta", "Estado", "Versión actual"]}
            rows={(recipes.data ?? []).map((recipe) => [
              recipe.name,
              recipe.status,
              recipe.current_version_id ? versionLabel(recipe.current_version_id) : "—",
            ])}
          />
        )}
      </Card>

      <Card
        title="Lotes de producción"
        actions={<Button onClick={() => setStartOpen(true)}>Iniciar lote</Button>}
      >
        {batches.isLoading ? <Loading /> : (
          <Table
            head={["Lote", "Versión", "Estado", "Producido", "Acciones"]}
            rows={(batches.data ?? []).map((batch) => [
              <span key="i" className="font-mono text-xs">{batch.id.slice(0, 8)}</span>,
              versionLabel(batch.recipe_version_id),
              <Pill key="s" value={batch.status} />,
              batch.quantity_produced ?? "—",
              <div key="a" className="flex flex-wrap gap-1.5">
                {["in_progress"].includes(batch.status) && (
                  <>
                    <Button kind="ghost" busy={output.isPending}
                      onClick={() => { setWasteProduct(""); setWasteQty(""); setOutputFor(batch.id); }}>
                      Registrar salida
                    </Button>
                    <Button kind="ghost" busy={confirmBatch.isPending} onClick={() => confirmBatch.mutate(batch.id)}>
                      Confirmar
                    </Button>
                    <Button kind="danger" busy={cancelBatch.isPending} onClick={() => cancelBatch.mutate(batch.id)}>
                      Cancelar
                    </Button>
                  </>
                )}
              </div>,
            ])}
          />
        )}
      </Card>

      <Modal open={startOpen} title="Iniciar lote de producción" onClose={() => setStartOpen(false)}>
        <Field label="Versión de receta">
          <Select value={versionId} onChange={(e) => setVersionId(e.target.value)}>
            <option value="">Selecciona…</option>
            {(recipes.data ?? []).filter((r) => r.current_version_id).map((recipe) => (
              <option key={recipe.current_version_id} value={recipe.current_version_id!}>
                {recipe.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setStartOpen(false)}>Cancelar</Button>
          <Button busy={startBatch.isPending} disabled={!versionId}
            onClick={() => startBatch.mutate(undefined, { onSuccess: () => setStartOpen(false) })}>
            Iniciar
          </Button>
        </div>
      </Modal>

      <Modal open={outputFor !== null} title="Registrar producción del lote" onClose={() => setOutputFor(null)}>
        <div className="space-y-3">
          <Field label="Producto producido">
            <Select value={wasteProduct} onChange={(e) => setWasteProduct(e.target.value)}>
              <option value="">Selecciona…</option>
              {(products.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Cantidad producida">
            <Input type="number" min="0" step="0.01" value={wasteQty} onChange={(e) => setWasteQty(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setOutputFor(null)}>Cancelar</Button>
          <Button
            busy={output.isPending}
            disabled={!wasteProduct || !wasteQty}
            onClick={() => {
              const product = (products.data ?? []).find((p) => p.id === wasteProduct);
              if (product && outputFor) {
                output.mutate(
                  { batchId: outputFor, productId: product.id, unitId: product.unit_id, qty: wasteQty },
                  { onSuccess: () => setOutputFor(null) },
                );
              }
            }}
          >
            Registrar salida
          </Button>
        </div>
      </Modal>
    </div>
  );
}
