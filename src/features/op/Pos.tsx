//! Punto de venta: cash session lifecycle (open, movements, arqueo, reopen),
//! takeaway/salon order intake with contextual flow advance, sale
//! consolidation and mixed-method charging.

import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/client";
import {
  Button, Card, errorText, Field, Input, Loading, money, Modal, Pill, ReasonModal,
  Select, Table, useAction, useData,
} from "../../ui/kit";

interface Register { id: string; name: string }
interface CashSession {
  id: string; register_id: string; status: string; opening_balance: number;
  expected_balance?: number; counted_balance?: number; difference?: number;
  opened_by?: string | null; opened_at?: string; closed_at?: string | null;
}
interface Product { id: string; code: string; name: string; is_sale_item: boolean }
interface Order {
  id: string; code: string; channel: string; status: string; customer_name?: string | null;
  total: number; table_id?: string | null;
}
interface Sale { id: string; order_id: string; status: string; subtotal: number; total: number }
interface Method { id: string; code: string; name: string }

type Step = { label?: string; kind: "link" | "status" | "dispatch"; body?: unknown };

/** Contextual next steps for a takeaway order (Fase 4 + Fase 5 flows). */
function nextSteps(status: string): Step[] {
  const statusBody = (target: string): Step => ({ kind: "status", body: { target } });
  const map: Record<string, Step[]> = {
    draft: [{ label: "Confirmar", kind: "link" }],
    confirmed: [{ label: "Enviar a cocina", kind: "link" }],
    sent_to_kitchen: [statusBody("in_preparation")],
    in_preparation: [statusBody("ready")],
    ready: [{ label: "Verificar despacho", kind: "dispatch" }],
    waiting_packaging: [{ label: "Empacar", kind: "dispatch" }],
    packaged: [{ label: "Listo para recojo", kind: "dispatch" }],
    ready_for_pickup: [{ label: "Entregar", kind: "dispatch" }],
  };
  return map[status] ?? [];
}

export default function Pos() {
  const [registerId, setRegisterId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("100");
  const [moveModal, setMoveModal] = useState<null | "in" | "out">(null);
  const [moveAmount, setMoveAmount] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [closeModal, setCloseModal] = useState(false);
  const [counted, setCounted] = useState("");
  const [diffReason, setDiffReason] = useState("");
  const [sessionDetail, setSessionDetail] = useState<CashSession | null>(null);

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [customer, setCustomer] = useState("");
  const [chargeTarget, setChargeTarget] = useState<Sale | null>(null);
  const [chargeMethod, setChargeMethod] = useState("cash");
  const [voidTarget, setVoidTarget] = useState<string | null>(null);

  const registers = useData<Register[]>(["cash", "registers"], "/cash/registers");
  const sessions = useData<CashSession[]>(
    ["cash", "sessions"],
    registerId ? `/cash/sessions?register_id=${registerId}` : "/cash/sessions",
    8000,
  );
  const products = useData<Product[]>(["products"], "/products");
  const orders = useData<Order[]>(["orders"], "/orders", 8000);
  const sales = useData<Sale[]>(["sales"], "/sales", 10000);
  const methods = useData<Method[]>(["payment-methods"], "/payment-methods");

  const openSession = useAction(
    () => api(`/cash/registers/${registerId || registers.data?.[0]?.id}/sessions`, {
      method: "POST",
      body: { opening_balance: Number(openingBalance) },
    }),
    { ok: "Sesión de caja abierta", invalidate: ["cash"] },
  );

  const addMovement = useAction(
    () => api(`/cash/sessions/${activeSession?.id}/movements`, {
      method: "POST",
      body: { movement_type: moveModal, amount: Number(moveAmount), reason: moveReason },
    }),
    { ok: "Movimiento registrado", invalidate: ["cash"] },
  );
  const closeSession = useAction(
    () => api(`/cash/sessions/${activeSession?.id}/close`, {
      method: "POST",
      body: { counted_balance: Number(counted), difference_reason: diffReason || null },
    }),
    { ok: "Arqueo cerrado", invalidate: ["cash"] },
  );
  const createOrder = useAction(
    () => api("/orders", {
      method: "POST",
      body: {
        channel: "llevar", table_id: null,
        customer_name: customer || null, notes: null,
        items: [{ product_id: product, quantity: Number(quantity), unit_price: Number(unitPrice), notes: null }],
      },
    }),
    { ok: "Pedido creado", invalidate: ["orders"] },
  );
  const advance = useAction(
    (order: Order) => runStep(order),
    { ok: "Pedido avanzado", invalidate: ["orders"] },
  );
  const sell = useAction(
    (order: Order) => api("/sales", { method: "POST", body: { order_id: order.id, adjustments: [] } }),
    { ok: "Venta consolidada — cobra ahora", invalidate: ["sales", "orders"] },
  );
  const charge = useAction(
    () => api(`/sales/${chargeTarget?.id}/payments`, {
      method: "POST",
      body: { method_code: chargeMethod, amount: chargeTarget?.total, reference: null, cash_session_id: activeSession?.id ?? null },
    }),
    { ok: "Cobro registrado", invalidate: ["sales"] },
  );
  const voidSale = useAction(
    (args: { id: string; reason: string }) =>
      api(`/sales/${args.id}/void`, { method: "POST", body: { reason: args.reason } }),
    { ok: "Venta anulada", invalidate: ["sales"] },
  );

  const activeSession = (sessions.data ?? []).find((session) => session.status === "open");
  const { hasPermission } = useAuth();

  /** One push-button execution of the contextual step. */
  async function runStep(order: Order) {
    const [step] = nextSteps(order.status);
    if (!step) return;
    if (step.kind === "link") {
      const path = step.label === "Confirmar"
        ? `/orders/${order.id}/confirm`
        : `/orders/${order.id}/send-to-kitchen`;
      await api(path, { method: "POST" });
      if (step.label === "Confirmar") await api(`/orders/${order.id}/send-to-kitchen`, { method: "POST" });
    } else if (step.kind === "status") {
      await api(`/orders/${order.id}/status`, { method: "POST", body: step.body });
    } else {
      if (step.label === "Verificar despacho") {
        await api(`/dispatch/${order.id}/verify`, { method: "POST" });
      } else if (step.label === "Empacar") {
        await api(`/dispatch/${order.id}/packages`, {
          method: "POST",
          body: { packages: [{ package_number: 1, contents_summary: "empaque mostrador" }] },
        });
      } else if (step.label === "Listo para recojo") {
        await api(`/dispatch/${order.id}/ready-for-pickup`, { method: "POST" });
      } else {
        await api(`/dispatch/${order.id}/deliver`, { method: "POST", body: { received_by: "Cliente en mostrador" } });
      }
    }
  }

  const sellable = (products.data ?? []).filter((p) => p.is_sale_item);
  const sellableOrders = (orders.data ?? []).filter((order) =>
    ["draft", "confirmed", "sent_to_kitchen", "in_preparation", "ready", "waiting_packaging", "packaged", "ready_for_pickup", "delivered"].includes(order.status));

  return (
    <div className="space-y-4">
      <Card title="Caja del turno">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-40">
            <Field label="Registro">
              <Select value={registerId} onChange={(e) => setRegisterId(e.target.value)}>
                <option value="">(principal)</option>
                {(registers.data ?? []).map((register) => (
                  <option key={register.id} value={register.id}>{register.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          {activeSession ? (
            <div className="text-sm text-ink-mut">
              Sesión abierta · fondo {money(activeSession.opening_balance)}
              {activeSession.expected_balance !== undefined && <> · esperado <b className="text-ink-txt">{money(activeSession.expected_balance)}</b></>}
            </div>
          ) : (
            <span className="text-sm text-ink-mut">Sin sesión abierta</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!activeSession && <Button onClick={() => setOpenModal(true)}>Abrir sesión</Button>}
          {activeSession && (
            <>
              <Button kind="ghost" onClick={() => setMoveModal("in")}>Ingreso de efectivo</Button>
              <Button kind="ghost" onClick={() => setMoveModal("out")}>Salida de efectivo</Button>
              <Button onClick={() => setCloseModal(true)}>Cerrar con arqueo</Button>
            </>
          )}
        </div>
      </Card>

      <Card title="Nuevo pedido (llevar)">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52">
            <Field label="Producto">
              <Select value={product} onChange={(e) => {
                setProduct(e.target.value);
                // Pre-fill the catalog price later via menu items; manual price for now.
                if (!unitPrice) setUnitPrice("6");
              }}>
                <option value="">Selecciona…</option>
                {sellable.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="w-24">
            <Field label="Cantidad"><Input type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
          </div>
          <div className="w-32">
            <Field label="Precio unit."><Input type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} /></Field>
          </div>
          <div className="min-w-40">
            <Field label="Cliente (opcional)"><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></Field>
          </div>
          <Button busy={createOrder.isPending} disabled={!product || !unitPrice} onClick={() => createOrder.mutate(undefined)}>
            Crear pedido
          </Button>
        </div>
      </Card>

      <Card title="Pedidos del turno">
        {orders.isLoading ? <Loading /> : (
          <Table
            head={["Pedido", "Canal", "Estado", "Total", "Acciones"]}
            rows={sellableOrders.map((order) => {
              const steps = nextSteps(order.status);
              const sale = (sales.data ?? []).find((s) => s.order_id === order.id && s.status === "completed");
              return [
                <span key="c" className="font-mono text-xs">{order.id.slice(0, 8)}</span>,
                order.channel,
                <Pill key="s" value={order.status} />,
                money(order.total),
                <div key="a" className="flex flex-wrap gap-1.5">
                  {steps.length > 0 && (
                    <Button kind="ghost" busy={advance.isPending} onClick={() => advance.mutate(order)}>
                      {steps[0].label}
                    </Button>
                  )}
                  {order.status === "delivered" && !sale && (
                    <Button busy={sell.isPending} onClick={() => sell.mutate(order)}>Vender</Button>
                  )}
                  {sale && <span className="text-xs text-emerald-300">Venta {money(sale.total)} consolidada</span>}
                </div>,
              ];
            })}
          />
        )}
      </Card>

      <Card title="Ventas y cobros">
        {sales.isLoading ? <Loading /> : (
          <Table
            head={["Venta", "Estado", "Subtotal", "Total", "Acciones"]}
            rows={(sales.data ?? []).map((sale) => [
              <span key="i" className="font-mono text-xs">{sale.id.slice(0, 8)}</span>,
              <Pill key="s" value={sale.status} />,
              money(sale.subtotal),
              money(sale.total),
              <div key="a" className="flex gap-1.5">
                {sale.status === "completed" && (
                  <Button kind="ghost" onClick={() => { setChargeTarget(sale); }}>Cobrar</Button>
                )}
                {sale.status === "completed" && hasPermission("sales.void") && (
                  <Button kind="danger" onClick={() => setVoidTarget(sale.id)}>Anular</Button>
                )}
              </div>,
            ])}
          />
        )}
      </Card>

      {/* Abrir sesión */}
      <Modal open={openModal} title="Abrir sesión de caja" onClose={() => setOpenModal(false)}>
        <Field label="Fondo inicial">
          <Input type="number" min="0" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button busy={openSession.isPending} onClick={() => { openSession.mutate(undefined); setOpenModal(false); }}>Abrir</Button>
        </div>
      </Modal>

      {/* Movimiento de caja */}
      <Modal open={moveModal !== null} title={moveModal === "in" ? "Ingreso de efectivo" : "Salida de efectivo"} onClose={() => setMoveModal(null)}>
        <div className="space-y-3">
          <Field label="Monto"><Input type="number" min="0" step="0.01" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} /></Field>
          <Field label="Motivo"><Input value={moveReason} onChange={(e) => setMoveReason(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setMoveModal(null)}>Cancelar</Button>
          <Button
            busy={addMovement.isPending}
            disabled={!moveAmount || !moveReason.trim()}
            onClick={() => { addMovement.mutate(undefined); setMoveModal(null); setMoveAmount(""); setMoveReason(""); }}
          >
            Registrar
          </Button>
        </div>
      </Modal>

      {/* Arqueo */}
      <Modal open={closeModal} title="Cerrar sesión (arqueo)" onClose={() => setCloseModal(false)}>
        <div className="space-y-3">
          <Field label="Efectivo contado">
            <Input type="number" min="0" step="0.01" value={counted} onChange={(e) => setCounted(e.target.value)} />
          </Field>
          {activeSession?.expected_balance !== undefined && counted && (
            <p className="text-sm text-ink-mut">
              Diferencia: <b className={Number(counted) !== activeSession.expected_balance ? "text-amber-300" : "text-emerald-300"}>
                {money(Number(counted) - activeSession.expected_balance)}
              </b>
            </p>
          )}
          <Field label="Motivo de la diferencia (si la hay)"><Input value={diffReason} onChange={(e) => setDiffReason(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setCloseModal(false)}>Cancelar</Button>
          <Button busy={closeSession.isPending} disabled={!counted} onClick={() => {
            closeSession.mutate(undefined, {
              onSuccess: (session) => { setSessionDetail(session as CashSession); setCloseModal(false); },
            });
          }}>Cerrar</Button>
        </div>
      </Modal>

      {/* Resultado del arqueo */}
      <Modal open={sessionDetail !== null} title="Arqueo cerrado" onClose={() => setSessionDetail(null)}>
        {sessionDetail && (
          <div className="space-y-1 text-sm">
            <p>Esperado: <b>{money(sessionDetail.expected_balance)}</b></p>
            <p>Contado: <b>{money(sessionDetail.counted_balance)}</b></p>
            <p>Diferencia: <b className={Number(sessionDetail.difference) !== 0 ? "text-amber-300" : "text-emerald-300"}>{money(sessionDetail.difference)}</b></p>
          </div>
        )}
      </Modal>

      {/* Cobro */}
      <Modal open={chargeTarget !== null} title={`Cobrar venta ${chargeTarget ? money(chargeTarget.total) : ""}`} onClose={() => setChargeTarget(null)}>
        <Field label="Medio de pago">
          <Select value={chargeMethod} onChange={(e) => setChargeMethod(e.target.value)}>
            {(methods.data ?? []).map((method) => (
              <option key={method.id} value={method.code}>{method.name}</option>
            ))}
          </Select>
        </Field>
        {!activeSession && chargeMethod === "cash" && (
          <p className="mt-2 text-xs text-amber-300">El efectivo se registra sin sesión de caja asociada.</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setChargeTarget(null)}>Cancelar</Button>
          <Button busy={charge.isPending} onClick={() => { charge.mutate(undefined); setChargeTarget(null); }}>Cobrar</Button>
        </div>
      </Modal>

      <ReasonModal
        open={voidTarget !== null}
        title="Anular venta"
        label="Motivo de la anulación (auditable)"
        onClose={() => setVoidTarget(null)}
        onSubmit={(reason) => voidTarget && voidSale.mutate({ id: voidTarget, reason })}
      />
      <p className="text-xs text-ink-mut">{errorText(orders.error)}</p>
    </div>
  );
}
