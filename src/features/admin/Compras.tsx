//! Compras: suppliers, purchase orders (create → submit → reception outside),
//! supplier invoices and payable settlement (finance side).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, money, Pill, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Supplier { id: string; name: string; status?: string }
interface Product { id: string; code: string; name: string }
interface Po { id: string; code: string; status: string; total: number }
interface Invoice { id: string; invoice_number: string; status?: string; total?: number }
interface Payable { id: string; supplier_invoice_id: string; status: string; amount_due: number }

export default function Compras() {
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const [sName, setSName] = useState("");
  const [sTax, setSTax] = useState("");
  const [poSupplier, setPoSupplier] = useState("");
  const [poProduct, setPoProduct] = useState("");
  const [poQty, setPoQty] = useState("10");
  const [poCost, setPoCost] = useState("");
  const [invSupplier, setInvSupplier] = useState("");
  const [invPo, setInvPo] = useState("");
  const [invNumber, setInvNumber] = useState("");
  const [invTotal, setInvTotal] = useState("");

  const suppliers = useData<Supplier[]>(["suppliers"], "/suppliers");
  const products = useData<Product[]>(["products"], "/products");
  const orders = useData<Po[]>(["purchasing", "orders"], "/purchasing/orders", 10000);
  const invoices = useData<Invoice[]>(["purchasing", "invoices"], "/purchasing/invoices", 10000);
  const payables = useData<Payable[]>(["finance", "payables"], "/finance/payables", 10000);

  const createSupplier = useAction(
    () => api("/suppliers", {
      method: "POST",
      body: { name: sName, tax_id: sTax || null, phone: null, email: null, address: null, notes: null },
    }),
    { ok: "Proveedor creado", invalidate: ["suppliers"] },
  );
  const createPo = useAction(
    () => api("/purchasing/orders", {
      method: "POST",
      body: {
        supplier_id: poSupplier, expected_date: null, notes: "panel",
        items: [{ product_id: poProduct, quantity: Number(poQty), unit_cost: Number(poCost) }],
      },
    }),
    { ok: "Orden creada (borrador)", invalidate: ["purchasing"] },
  );
  const submitPo = useAction(
    (id: string) => api(`/purchasing/orders/${id}/submit`, { method: "POST" }),
    { ok: "Orden enviada al proveedor", invalidate: ["purchasing"] },
  );
  const cancelPo = useAction(
    (id: string) => api(`/purchasing/orders/${id}/cancel`, { method: "POST" }),
    { ok: "Orden cancelada", invalidate: ["purchasing"] },
  );
  const createInvoice = useAction(
    () => api("/purchasing/invoices", {
      method: "POST",
      body: {
        supplier_id: invSupplier, purchase_order_id: invPo || null,
        invoice_number: invNumber, issued_at: null, total: Number(invTotal),
      },
    }),
    { ok: "Factura registrada", invalidate: ["purchasing"] },
  );
  const settlePayable = useAction(
    (id: string) => api(`/finance/payables/${id}/settle`, { method: "POST" }),
    { ok: "Cuenta por pagar liquidada", invalidate: ["finance"] },
  );

  return (
    <div className="space-y-4">
      <Card
        title={`Proveedores (${suppliers.data?.length ?? 0})`}
        actions={<Button onClick={() => setSupplierOpen(true)}>Nuevo proveedor</Button>}
      >
        {suppliers.isLoading ? <Loading /> : (
          <Table
            head={["Nombre", "RUC/NIT", "Estado"]}
            rows={(suppliers.data ?? []).map((supplier) => [
              supplier.name,
              (supplier as Supplier & { tax_id?: string }).tax_id ?? "—",
              supplier.status ?? "active",
            ])}
          />
        )}
      </Card>

      <Card
        title="Órdenes de compra"
        actions={<Button onClick={() => setPoOpen(true)}>Nueva orden</Button>}
      >
        {orders.isLoading ? <Loading /> : (
          <Table
            head={["Código", "Estado", "Total", "Acciones"]}
            rows={(orders.data ?? []).map((order) => [
              <span key="c" className="font-mono text-xs">{order.code}</span>,
              <Pill key="s" value={order.status} />,
              money(order.total),
              <div key="a" className="flex gap-1.5">
                {order.status === "draft" && (
                  <Button kind="ghost" busy={submitPo.isPending} onClick={() => submitPo.mutate(order.id)}>Enviar</Button>
                )}
                {["draft", "submitted"].includes(order.status) && (
                  <Button kind="danger" busy={cancelPo.isPending} onClick={() => cancelPo.mutate(order.id)}>Cancelar</Button>
                )}
              </div>,
            ])}
          />
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Facturas de proveedor" actions={<Button onClick={() => setInvoiceOpen(true)}>Registrar factura</Button>}>
          {invoices.isLoading ? <Loading /> : (
            <Table
              head={["Número", "Total"]}
              rows={(invoices.data ?? []).map((invoice) => [invoice.invoice_number, money(invoice.total ?? 0)])}
            />
          )}
        </Card>

        <Card title="Cuentas por pagar">
          {payables.isLoading ? <Loading /> : (
            <Table
              head={["Factura", "Monto", "Estado", ""]}
              rows={(payables.data ?? []).map((payable) => [
                (invoices.data ?? []).find((invoice) => invoice.id === payable.supplier_invoice_id)?.invoice_number
                  ?? payable.supplier_invoice_id.slice(0, 8),
                money(payable.amount_due),
                <Pill key="s" value={payable.status} />,
                payable.status === "open" && (
                  <Button key="b" kind="ghost" busy={settlePayable.isPending} onClick={() => settlePayable.mutate(payable.id)}>
                    Liquidar
                  </Button>
                ),
              ])}
            />
          )}
        </Card>
      </div>

      <Modal open={supplierOpen} title="Nuevo proveedor" onClose={() => setSupplierOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre"><Input value={sName} onChange={(e) => setSName(e.target.value)} /></Field>
          <Field label="RUC/NIT (opcional)"><Input value={sTax} onChange={(e) => setSTax(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setSupplierOpen(false)}>Cancelar</Button>
          <Button busy={createSupplier.isPending} disabled={!sName.trim()}
            onClick={() => createSupplier.mutate(undefined, { onSuccess: () => setSupplierOpen(false) })}>
            Crear
          </Button>
        </div>
      </Modal>

      <Modal open={poOpen} title="Nueva orden de compra" onClose={() => setPoOpen(false)}>
        <div className="space-y-3">
          <Field label="Proveedor">
            <Select value={poSupplier} onChange={(e) => setPoSupplier(e.target.value)}>
              <option value="">Selecciona…</option>
              {(suppliers.data ?? []).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Producto (insumo)">
            <Select value={poProduct} onChange={(e) => setPoProduct(e.target.value)}>
              <option value="">Selecciona…</option>
              {(products.data ?? []).map((product) => (
                <option key={product.id} value={product.id}>{product.code} · {product.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cantidad"><Input type="number" min="0" step="0.01" value={poQty} onChange={(e) => setPoQty(e.target.value)} /></Field>
            <Field label="Costo unitario"><Input type="number" min="0" step="0.01" value={poCost} onChange={(e) => setPoCost(e.target.value)} /></Field>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setPoOpen(false)}>Cancelar</Button>
          <Button busy={createPo.isPending} disabled={!poSupplier || !poProduct || !poCost}
            onClick={() => createPo.mutate(undefined, { onSuccess: () => setPoOpen(false) })}>
            Crear orden
          </Button>
        </div>
      </Modal>

      <Modal open={invoiceOpen} title="Registrar factura de proveedor" onClose={() => setInvoiceOpen(false)}>
        <div className="space-y-3">
          <Field label="Proveedor">
            <Select value={invSupplier} onChange={(e) => setInvSupplier(e.target.value)}>
              <option value="">Selecciona…</option>
              {(suppliers.data ?? []).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Orden de compra (opcional)">
            <Select value={invPo} onChange={(e) => setInvPo(e.target.value)}>
              <option value="">Ninguna</option>
              {(orders.data ?? []).map((order) => (
                <option key={order.id} value={order.id}>{order.code} · {money(order.total)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Número de factura"><Input value={invNumber} onChange={(e) => setInvNumber(e.target.value)} /></Field>
          <Field label="Total"><Input type="number" min="0" step="0.01" value={invTotal} onChange={(e) => setInvTotal(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setInvoiceOpen(false)}>Cancelar</Button>
          <Button busy={createInvoice.isPending} disabled={!invSupplier || !invNumber.trim() || !invTotal}
            onClick={() => createInvoice.mutate(undefined, { onSuccess: () => setInvoiceOpen(false) })}>
            Registrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
