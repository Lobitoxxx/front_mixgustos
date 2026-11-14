//! Inventario: lots with transfer/waste, alerts (low stock + expiry),
//! locations and physical counts (open → add items → close → adjust).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, money, Pill,
  Select, Table, useAction, useData,
} from "../../ui/kit";

interface Location { id: string; name: string }
interface Product { id: string; code: string; name: string }
interface Lot {
  id: string; product_id: string; quantity: number; unit_cost: number;
  expires_at?: string | null;
}
interface Alert { product_id?: string; product_name?: string; available?: number; min_stock?: number; message?: string }
interface Count {
  id: string; code: string; status: string;
  items?: { id: string; product_id: string; counted_quantity: number; difference?: number }[];
}

export default function Inventario() {
  const [transferFor, setTransferFor] = useState<Lot | null>(null);
  const [wasteOpen, setWasteOpen] = useState(false);
  const [countOpen, setCountOpen] = useState(false);
  const [countId, setCountId] = useState<string | null>(null);

  const [destLocation, setDestLocation] = useState("");
  const [wasteProduct, setWasteProduct] = useState("");
  const [wasteQty, setWasteQty] = useState("");
  const [wasteReason, setWasteReason] = useState("");
  const [countCode, setCountCode] = useState("");
  const [countProduct, setCountProduct] = useState("");
  const [countQty, setCountQty] = useState("");

  const locations = useData<Location[]>(["inventory", "locations"], "/inventory/locations");
  const lots = useData<Lot[]>(["inventory", "lots"], "/inventory/lots", 12000);
  const products = useData<Product[]>(["products"], "/products");
  const low = useData<Alert[]>(["inventory", "low"], "/inventory/alerts/low-stock", 30000);
  const expiry = useData<Alert[]>(["inventory", "expiry"], "/inventory/alerts/expiry", 30000);
  const counts = useData<Count[]>(["inventory", "counts"], "/inventory/counts", 15000);
  const detail = useData<Count>(
    ["inventory", "count", countId],
    countId ? `/inventory/counts/${countId}` : "",
    undefined,
    !!countId,
  );

  const transfer = useAction(
    () => api(`/inventory/lots/${transferFor?.id}/transfer`, {
      method: "POST",
      body: { destination_location_id: destLocation, reason: "traslado desde panel" },
    }),
    { ok: "Lote trasladado", invalidate: ["inventory"] },
  );
  const waste = useAction(
    () => api("/inventory/waste", {
      method: "POST",
      body: { product_id: wasteProduct, quantity: Number(wasteQty), policy: "peps", reason: wasteReason },
    }),
    { ok: "Merma registrada", invalidate: ["inventory"] },
  );
  const openCount = useAction(
    () => api("/inventory/counts", {
      method: "POST",
      body: { code: countCode, location_id: null, notes: "conteo desde panel" },
    }),
    { ok: "Conteo abierto", invalidate: ["inventory"] },
  );
  const addCountItem = useAction(
    () => api(`/inventory/counts/${countId}/items`, {
      method: "POST",
      body: { product_id: countProduct, counted_quantity: Number(countQty) },
    }),
    { ok: "Ítem contado", invalidate: ["inventory", "count"] },
  );
  const closeCount = useAction(
    (id: string) => api(`/inventory/counts/${id}/close`, { method: "POST" }),
    { ok: "Conteo cerrado", invalidate: ["inventory"] },
  );
  const adjustItem = useAction(
    (args: { countId: string; itemId: string }) =>
      api(`/inventory/counts/${args.countId}/adjust`, { method: "POST", body: { item_id: args.itemId, policy: "peps" } }),
    { ok: "Ajuste aplicado (auditable)", invalidate: ["inventory", "count"] },
  );

  const productName = (id: string) => (products.data ?? []).find((p) => p.id === id)?.name ?? id.slice(0, 8);
  const openCount_ = (counts.data ?? []).find((count) => count.status === "open");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`Alertas de stock bajo (${low.data?.length ?? 0})`}>
          {low.isLoading ? <Loading /> : (
            <Table
              head={["Producto", "Disponible", "Mínimo"]}
              rows={(low.data ?? []).map((alert) => [
                alert.product_name ?? alert.product_id?.slice(0, 8) ?? "?",
                alert.available ?? "—",
                alert.min_stock ?? "—",
              ])}
            />
          )}
        </Card>
        <Card title={`Alertas de vencimiento (${expiry.data?.length ?? 0})`}>
          {expiry.isLoading ? <Loading /> : (
            <Table
              head={["Mensaje"]}
              rows={(expiry.data ?? []).map((alert) => [alert.message ?? alert.product_name ?? "?"])}
            />
          )}
        </Card>
      </div>

      <Card
        title={`Lotes (${lots.data?.length ?? 0})`}
        actions={
          <div className="flex gap-2">
            {openCount_ && <Pill value={`conteo ${openCount_.code} abierto`} />}
            <Button kind="ghost" onClick={() => setWasteOpen(true)}>Registrar merma</Button>
            <Button kind="ghost" onClick={() => setCountOpen(true)}>Conteo físico</Button>
          </div>
        }
      >
        {lots.isLoading ? <Loading /> : (
          <Table
            head={["Lote", "Producto", "Cantidad", "Costo", "Vence", "Acción"]}
            rows={(lots.data ?? []).map((lot) => [
              <span key="l" className="font-mono text-xs">{lot.id.slice(0, 8)}</span>,
              productName(lot.product_id),
              lot.quantity,
              money(lot.unit_cost),
              lot.expires_at ? new Date(lot.expires_at).toLocaleDateString("es") : "—",
              <Button key="b" kind="ghost" onClick={() => setTransferFor(lot)}>Trasladar</Button>,
            ])}
          />
        )}
      </Card>

      {openCount_ && (
        <Card title={`Conteo abierto ${openCount_.code}`}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-52">
              <Field label="Producto">
                <Select value={countProduct} onChange={(e) => setCountProduct(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {(products.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
            </div>
            <div className="w-28">
              <Field label="Contado"><Input type="number" min="0" step="0.01" value={countQty} onChange={(e) => setCountQty(e.target.value)} /></Field>
            </div>
            <Button busy={addCountItem.isPending} disabled={!countProduct || !countQty}
              onClick={() => addCountItem.mutate(undefined, { onSuccess: () => setCountId(openCount_.id) })}>
              Agregar al conteo
            </Button>
            <Button kind="danger" busy={closeCount.isPending} onClick={() => closeCount.mutate(openCount_.id)}>
              Cerrar conteo
            </Button>
          </div>
          {detail.data?.items && detail.data.items.length > 0 && (
            <div className="mt-3">
              <Table
                head={["Producto", "Contado", "Diferencia", ""]}
                rows={detail.data.items.map((item) => [
                  productName(item.product_id),
                  item.counted_quantity,
                  item.difference ?? "—",
                  item.difference !== undefined && item.difference !== 0 && (
                    <Button key="b" kind="ghost" busy={adjustItem.isPending}
                      onClick={() => adjustItem.mutate({ countId: openCount_.id, itemId: item.id })}>
                      Ajustar
                    </Button>
                  ),
                ])}
              />
            </div>
          )}
        </Card>
      )}

      <Modal open={countOpen} title="Abrir conteo físico" onClose={() => setCountOpen(false)}>
        <Field label="Código del conteo"><Input value={countCode} onChange={(e) => setCountCode(e.target.value)} placeholder="Ej. C-2026-11" /></Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setCountOpen(false)}>Cancelar</Button>
          <Button busy={openCount.isPending} disabled={!countCode.trim()}
            onClick={() => openCount.mutate(undefined, { onSuccess: () => setCountOpen(false) })}>
            Abrir
          </Button>
        </div>
      </Modal>

      <Modal open={transferFor !== null} title="Trasladar lote" onClose={() => setTransferFor(null)}>
        <Field label="Ubicación destino">
          <Select value={destLocation} onChange={(e) => setDestLocation(e.target.value)}>
            <option value="">Selecciona…</option>
            {(locations.data ?? []).map((location) => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </Select>
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setTransferFor(null)}>Cancelar</Button>
          <Button busy={transfer.isPending} disabled={!destLocation}
            onClick={() => transfer.mutate(undefined, { onSuccess: () => setTransferFor(null) })}>
            Trasladar
          </Button>
        </div>
      </Modal>

      <Modal open={wasteOpen} title="Registrar merma" onClose={() => setWasteOpen(false)}>
        <div className="space-y-3">
          <Field label="Producto">
            <Select value={wasteProduct} onChange={(e) => setWasteProduct(e.target.value)}>
              <option value="">Selecciona…</option>
              {(products.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Cantidad"><Input type="number" min="0" step="0.01" value={wasteQty} onChange={(e) => setWasteQty(e.target.value)} /></Field>
          <Field label="Motivo (auditable)"><Input value={wasteReason} onChange={(e) => setWasteReason(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setWasteOpen(false)}>Cancelar</Button>
          <Button busy={waste.isPending} disabled={!wasteProduct || !wasteQty || !wasteReason.trim()}
            onClick={() => waste.mutate(undefined, { onSuccess: () => setWasteOpen(false) })}>
            Registrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
