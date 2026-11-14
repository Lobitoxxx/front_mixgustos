//! Kitchen queue: orders sent to kitchen across all channels, grouped by
//! stage, with polling and one-click stage advance (§8.3 kitchen loop).

import { api } from "../../api/client";
import { Button, Card, Loading, Pill, useAction, useData } from "../../ui/kit";

interface Order {
  id: string; code: string; channel: string; status: string;
  customer_name?: string | null; total: number;
}

const GROUPS: { status: string; title: string; next?: string; nextLabel?: string }[] = [
  { status: "sent_to_kitchen", title: "Enviados a cocina", next: "in_preparation", nextLabel: "Preparar" },
  { status: "in_preparation", title: "En preparación", next: "ready", nextLabel: "Marcar listo" },
  { status: "ready", title: "Listos", next: "delivered", nextLabel: "Entregar (salón)" },
];export default function Cola() {
  const orders = useData<Order[]>(["orders"], "/orders", 6000);
  const transition = useAction(
    (args: { id: string; target: string }) =>
      api(`/orders/${args.id}/status`, { method: "POST", body: { target: args.target } }),
    { ok: "Pedido avanzado", invalidate: ["orders"] },
  );

  const all = orders.data ?? [];
  const sent = all.filter((order) => !["delivered", "cancelled"].includes(order.status));

  return (
    <div className="space-y-4">
      {orders.isLoading && <Loading />}
      <div className="grid gap-4 lg:grid-cols-3">
        {GROUPS.map((group) => {
          const items = sent.filter((order) => order.status === group.status);
          return (
            <Card key={group.status} title={`${group.title} (${items.length})`}>
              <div className="space-y-2">
                {items.length === 0 && <p className="text-sm text-ink-mut">—</p>}
                {items.map((order) => (
                  <div key={order.id} className="rounded-lg border border-ink-line bg-ink-700/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{order.id.slice(0, 8)}</span>
                      <Pill value={order.channel} />
                      <div className="flex-1" />
                      <span className="text-sm font-semibold">{Number(order.total).toFixed(2)}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-mut">
                      {order.customer_name ?? "Sin cliente"}
                    </p>
                    {group.next && order.channel === "salon" && (
                      <Button
                        kind="ghost"
                        busy={transition.isPending}
                        className="mt-2 w-full"
                        onClick={() => transition.mutate({ id: order.id, target: group.next! })}
                      >
                        {group.nextLabel}
                      </Button>
                    )}
                    {group.status === "ready" && order.channel !== "salon" && (
                      <p className="mt-2 text-xs text-ink-mut">Pasa al tablero de despacho →</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
