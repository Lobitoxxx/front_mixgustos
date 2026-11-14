//! Catálogo: products with units, create product, record sale/purchase price
//! (prices.change is sensitive — backend audits), create category.

import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, Pill, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Unit { id: string; code: string }
interface Product {
  id: string; code: string; name: string; unit_id: string; is_ingredient: boolean;
  is_sale_item: boolean; min_stock?: number | null; active?: boolean;
}

export default function Productos() {
  const { hasPermission } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [priceFor, setPriceFor] = useState<Product | null>(null);
  const [priceValue, setPriceValue] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState("");
  const [kind, setKind] = useState("sale");
  const [minStock, setMinStock] = useState("0");

  const products = useData<Product[]>(["products"], "/products", 15000);
  const units = useData<Unit[]>(["units"], "/products/units");

  const create = useAction(
    () => api("/products", {
      method: "POST",
      body: {
        code, name, category_id: null, unit_id: unitId,
        is_ingredient: kind === "ing" || kind === "both",
        is_sale_item: kind === "sale" || kind === "both",
        rotation_policy: "peps",
        min_stock: Number(minStock) || 0,
        perishable: false,
        storage_requirements: "",
      },
    }),
    { ok: "Producto creado", invalidate: ["products"] },
  );
  const recordPrice = useAction(
    () => api(`/products/${priceFor?.id}/prices`, {
      method: "POST",
      body: { price_type: "sale", unit_price: Number(priceValue) },
    }),
    { ok: "Precio registrado", invalidate: ["products"] },
  );

  const unitCode = (id: string) => (units.data ?? []).find((u) => u.id === id)?.code ?? "?";

  return (
    <div className="space-y-4">
      <Card
        title={`Productos activos (${products.data?.length ?? 0})`}
        actions={hasPermission("products.create") && <Button onClick={() => setCreateOpen(true)}>Nuevo producto</Button>}
      >
        {products.isLoading ? <Loading /> : (
          <Table
            head={["Código", "Nombre", "Unidad", "Mín.", "Tipo", "Acciones"]}
            rows={(products.data ?? []).map((product) => [
              <span key="c" className="font-mono text-xs">{product.code}</span>,
              product.name,
              unitCode(product.unit_id),
              String(product.min_stock ?? 0),
              product.is_ingredient && product.is_sale_item
                ? <Pill key="t" value="ambos" />
                : product.is_ingredient
                  ? <Pill key="t" value="insumo" />
                  : <Pill key="t" value="venta" />,
              hasPermission("prices.change") && (
                <Button key="b" kind="ghost" onClick={() => { setPriceFor(product); setPriceValue(""); }}>
                  Precio
                </Button>
              ),
            ])}
          />
        )}
      </Card>

      <Modal open={createOpen} title="Nuevo producto" onClose={() => setCreateOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código"><Input value={code} onChange={(e) => setCode(e.target.value)} /></Field>
          <Field label="Nombre"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Unidad">
            <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">Selecciona…</option>
              {(units.data ?? []).map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.code}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo">
            <Select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="sale">Producto de venta</option>
              <option value="ing">Insumo</option>
              <option value="both">Ambos</option>
            </Select>
          </Field>
          <Field label="Stock mínimo"><Input type="number" min="0" step="0.01" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button
            busy={create.isPending}
            disabled={!code.trim() || !name.trim() || !unitId}
            onClick={() => create.mutate(undefined, { onSuccess: () => setCreateOpen(false) })}
          >
            Crear
          </Button>
        </div>
      </Modal>

      <Modal open={priceFor !== null} title={`Precio de venta · ${priceFor?.name ?? ""}`} onClose={() => setPriceFor(null)}>
        <Field label="Nuevo precio unitario">
          <Input type="number" min="0" step="0.01" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} />
        </Field>
        <p className="mt-2 text-xs text-ink-mut">Se registra en el historial de precios con auditoría.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setPriceFor(null)}>Cancelar</Button>
          <Button
            busy={recordPrice.isPending}
            disabled={!priceValue}
            onClick={() => recordPrice.mutate(undefined, { onSuccess: () => setPriceFor(null) })}
          >
            Registrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
