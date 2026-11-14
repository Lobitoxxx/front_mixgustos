//! Ventas: consolidated sales with their payments (detail fetch) and void
//! with reason (sales.void, audited).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, dateTime, Loading, money, Modal, Pill, ReasonModal,
  Table, useAction, useData,
} from "../../ui/kit";

interface Sale {
  id: string; order_id: string; status: string; subtotal: number; total: number;
  created_at?: string;
}
interface Payment { id: string; amount: number; method_code?: string; created_at?: string }

export default function Ventas() {
  const [detailFor, setDetailFor] = useState<Sale | null>(null);
  const [voidTarget, setVoidTarget] = useState<string | null>(null);

  const sales = useData<Sale[]>(["sales"], "/sales", 10000);
  const payments = useData<Payment[]>(
    ["sale-payments", detailFor?.id ?? "none"],
    detailFor ? `/sales/${detailFor.id}/payments` : "",
    undefined,
    !!detailFor,
  );

  const voidSale = useAction(
    (args: { id: string; reason: string }) =>
      api(`/sales/${args.id}/void`, { method: "POST", body: { reason: args.reason } }),
    { ok: "Venta anulada", invalidate: ["sales"] },
  );

  return (
    <div className="space-y-4">
      <Card title={`Ventas (${sales.data?.length ?? 0})`}>
        {sales.isLoading ? <Loading /> : (
          <Table
            head={["Venta", "Fecha", "Estado", "Subtotal", "Total", "Acciones"]}
            rows={(sales.data ?? []).map((sale) => [
              <span key="i" className="font-mono text-xs">{sale.id.slice(0, 8)}</span>,
              dateTime(sale.created_at),
              <Pill key="s" value={sale.status} />,
              money(sale.subtotal),
              money(sale.total),
              <div key="a" className="flex gap-1.5">
                <Button kind="ghost" onClick={() => setDetailFor(sale)}>Pagos</Button>
                {sale.status === "completed" && (
                  <Button kind="danger" onClick={() => setVoidTarget(sale.id)}>Anular</Button>
                )}
              </div>,
            ])}
          />
        )}
      </Card>

      <Modal open={detailFor !== null} title={`Pagos · ${detailFor?.id.slice(0, 8) ?? ""}`} onClose={() => setDetailFor(null)}>
        {payments.isLoading ? <Loading /> : (
          <Table
            head={["Medio", "Monto", "Fecha"]}
            rows={(payments.data ?? []).map((payment) => [
              payment.method_code ?? "—",
              money(payment.amount),
              dateTime(payment.created_at),
            ])}
          />
        )}
      </Modal>

      <ReasonModal
        open={voidTarget !== null}
        title="Anular venta"
        label="Motivo de la anulación (auditable)"
        onClose={() => setVoidTarget(null)}
        onSubmit={(reason) => voidTarget && voidSale.mutate({ id: voidTarget, reason })}
      />
    </div>
  );
}
