//! Recepción de mercadería: direct lot reception and goods receipt against
//! submitted purchase orders (each line creates a lot in the location).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, money, Pill, Select, Table, useAction, useData,
} from "../../ui/kit";

interface Supplier { id: string; name: string }
interface Location { id: string; name: string }
interface Product { id: string; code: string; name: string; is_ingredient: boolean }
interface PoItem { id: string; product_id: string; quantity: number; received_quantity: number; unit_cost?: number }
interface Po {
  id: string; code: string; status: string; total: number;
  items: PoItem[]; supplier_id?: string;
}
interface Lot {
  id: string; product_id: string; lot_number?: string | null; quantity: number;
  unit_cost: number; location_id?: string; expires_at?: string | null;
}

export default function Recepcion() {
  const [directProduct, setDirectProduct] = useState("");
  const [directLocation, setDirectLocation] = useState("");
  const [directQuantity, setDirectQuantity] = useState("");
  const [directCost, setDirectCost] = useState("");
  const [directExpiry, setDirectExpiry] = useState("");
  const [receiving, setReceiving] = useState<Po | null>(null);
  const [rcLocation, setRcLocation] = useState("");
  const [rcExpiry, setRcExpiry] = useState("");

  const suppliers = useData<Supplier[]>(["suppliers"], "/suppliers");
  const locations = useData<Location[]>(["inventory", "locations"], "/inventory/locations");
  const products = useData<Product[]>(["products"], "/products");
  const orders = useData<Po[]>(["purchasing", "submitted"], "/purchasing/orders?status=submitted", 10000);
  const lots = useData<Lot[]>(["inventory", "lots"], "/inventory/lots", 15000);

  const receiveDirect = useAction(
    () => api("/inventory/receptions", {
      method: "POST",
      body: {
        product_id: directProduct,
        lot_number: null,
        supplier_id: suppliers.data?.[0]?.id ?? null,
        location_id: directLocation,
        quantity: Number(directQuantity),
        unit_cost: Number(directCost),
        expires_at: directExpiry ? new Date(directExpiry).toISOString() : null,
      },
    }),
    { ok: "Lote recibido", invalidate: ["inventory"] },
  );
  const receivePo = useAction((order: Po) => api(`/purchasing/orders/${order.id}/receipts`, {
    method: "POST",
    body: {
      code: null,
      notes: "recepción desde panel",
      lines: order.items.map((item) => ({
        purchase_order_item_id: item.id,
        quantity: item.quantity,
        unit_cost: itemCost(order, item.product_id),
        location_id: rcLocation,
        expires_at: rcExpiry ? new Date(rcExpiry).toISOString() : null,
        difference_reason: null,
      })),
    },
  }), {
    ok: "Mercadería recibida contra la orden",
    invalidate: ["purchasing", "inventory"],
  });

  function itemCost(order: Po, productId: string): number {
    // The PO detail endpoint carries unit_cost; the list shape may not.
    // Fall back to total/quantity ratio when needed.
    const item = (order as Po & { items: (PoItem & { unit_cost?: number })[] }).items
      .find((candidate) => candidate.product_id === productId);
    if (item?.unit_cost) return item.unit_cost;
    const totalQty = order.items.reduce((acc, candidate) => acc + Number(candidate.quantity), 0);
    return totalQty > 0 ? Number(order.total) / totalQty : 0;
  }

  return (
    <div className="space-y-4">
      <Card title="Recepción directa (lote nuevo)">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52">
            <Field label="Producto">
              <Select value={directProduct} onChange={(e) => setDirectProduct(e.target.value)}>
                <option value="">Selecciona…</option>
                {(products.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="min-w-40">
            <Field label="Ubicación">
              <Select value={directLocation} onChange={(e) => setDirectLocation(e.target.value)}>
                <option value="">Selecciona…</option>
                {(locations.data ?? []).map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="w-28">
            <Field label="Cantidad"><Input type="number" min="0" step="0.01" value={directQuantity} onChange={(e) => setDirectQuantity(e.target.value)} /></Field>
          </div>
          <div className="w-32">
            <Field label="Costo unit."><Input type="number" min="0" step="0.01" value={directCost} onChange={(e) => setDirectCost(e.target.value)} /></Field>
          </div>
          <div className="w-40">
            <Field label="Vence (opcional)"><Input type="date" value={directExpiry} onChange={(e) => setDirectExpiry(e.target.value)} /></Field>
          </div>
          <Button busy={receiveDirect.isPending}
            disabled={!directProduct || !directLocation || !directQuantity || !directCost}
            onClick={() => receiveDirect.mutate(undefined)}>
            Recibir
          </Button>
        </div>
      </Card>

      <Card title="Órdenes de compra por recibir">
        {orders.isLoading ? <Loading /> : (
          <Table
            head={["Orden", "Estado", "Total", "Líneas", "Acción"]}
            rows={(orders.data ?? []).map((order) => [
              <span key="c" className="font-mono text-xs">{order.code}</span>,
              <Pill key="s" value={order.status} />,
              money(order.total),
              order.items.length,
              <Button key="b" kind="ghost" busy={receivePo.isPending}
                onClick={() => setReceiving(order)}>Recibir…</Button>,
            ])}
          />
        )}
      </Card>

      {receiving && (
        <Card title={`Recepción de la orden ${receiving.code}`}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-40">
              <Field label="Ubicación destino">
                <Select value={rcLocation} onChange={(e) => setRcLocation(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {(locations.data ?? []).map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-40">
              <Field label="Vence (opcional)"><Input type="date" value={rcExpiry} onChange={(e) => setRcExpiry(e.target.value)} /></Field>
            </div>
            <Button busy={receivePo.isPending}
              disabled={!rcLocation}
              onClick={() => receivePo.mutate(receiving, { onSuccess: () => setReceiving(null) })}>
              Recibir {receiving.items.length} línea(s)
            </Button>
          </div>
        </Card>
      )}

      <Card title="Lotes en inventario">
        {lots.isLoading ? <Loading /> : (
          <Table
            head={["Lote", "Producto", "Cantidad", "Costo", "Vence"]}
            rows={(lots.data ?? []).map((lot) => [
              <span key="l" className="font-mono text-xs">{lot.lot_number ?? lot.id.slice(0, 8)}</span>,
              lot.product_id.slice(0, 8),
              lot.quantity,
              money(lot.unit_cost),
              lot.expires_at ? new Date(lot.expires_at).toLocaleDateString("es") : "—",
            ])}
          />
        )}
      </Card>
    </div>
  );
}
