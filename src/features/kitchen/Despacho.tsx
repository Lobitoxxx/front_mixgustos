//! Dispatch board for takeaway/web orders: verify → package → ready →
//! deliver, with incident registration and per-order incident history.

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Modal, Pill, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Order {
  id: string; code: string; channel: string; status: string; total: number;
}
interface Incident { id: string; incident_type: string; description: string; order_id?: string }

const STAGES: { status: string; title: string; action?: string; actionLabel?: string }[] = [
  { status: "ready", title: "Listos por verificar", action: "verify", actionLabel: "Verificar" },
  { status: "waiting_packaging", title: "Por empacar", action: "packages", actionLabel: "Empacar" },
  { status: "packaged", title: "Empacados", action: "ready_for_pickup", actionLabel: "Listo para recojo" },
  { status: "ready_for_pickup", title: "Para recojo", action: "deliver", actionLabel: "Entregar" },
  { status: "delivered", title: "Entregados" },
];

export default function Despacho() {
  const [incidentFor, setIncidentFor] = useState<Order | null>(null);
  const [incidentType, setIncidentType] = useState("delayed");
  const [incidentDesc, setIncidentDesc] = useState("");

  const orders = useData<Order[]>(["orders"], "/orders", 6000);
  const incidents = useData<Incident[]>(
    ["incidents", incidentFor?.id ?? "none"],
    incidentFor ? `/dispatch/${incidentFor.id}/incidents` : "",
    undefined,
    incidentFor !== null,
  );

  const run = useAction(
    (args: { id: string; action: string; body?: unknown }) =>
      api(`/dispatch/${args.id}/${args.action}`, { method: "POST", body: args.body }),
    { ok: "Despacho actualizado", invalidate: ["orders"] },
  );
  const registerIncident = useAction(
    () => api(`/dispatch/${incidentFor?.id}/incidents`, {
      method: "POST",
      body: { incident_type: incidentType, description: incidentDesc },
    }),
    { ok: "Incidencia registrada", invalidate: ["incidents"] },
  );

  const relevant = (orders.data ?? []).filter((order) =>
    ["llevar", "web"].includes(order.channel) &&
    ["ready", "waiting_packaging", "packaged", "ready_for_pickup", "delivered"].includes(order.status));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const items = relevant.filter((order) => order.status === stage.status);
          return (
            <Card key={stage.status} title={`${stage.title} (${items.length})`}>
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
                    <div className="mt-2 flex flex-col gap-1.5">
                      {stage.action && (
                        <Button kind="ghost" busy={run.isPending}
                          onClick={() => run.mutate({
                            id: order.id,
                            action: stage.action!,
                            body: stage.action === "package"
                              ? { packages: [{ package_number: 1, contents_summary: "empaque mostrador" }] }
                              : stage.action === "deliver" ? { received_by: "Cliente en mostrador" } : undefined,
                          })}>
                          {stage.actionLabel}
                        </Button>
                      )}
                      <Button kind="ghost" className="text-xs" onClick={() => setIncidentFor(order)}>
                        Incidencias
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={incidentFor !== null} title={`Incidencias · ${incidentFor?.id.slice(0, 8) ?? ""}`} onClose={() => setIncidentFor(null)}>
        <div className="space-y-3">
          <Field label="Tipo">
            <Select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
              <option value="delayed">Retraso</option>
              <option value="not_picked_up">No recogido</option>
              <option value="wrong_order">Pedido erróneo</option>
              <option value="other">Otro</option>
            </Select>
          </Field>
          <Field label="Descripción"><Input value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)} /></Field>
          <Button busy={registerIncident.isPending} disabled={!incidentDesc.trim()}
            onClick={() => registerIncident.mutate(undefined, { onSuccess: () => setIncidentDesc("") })}>
            Registrar incidencia
          </Button>
          {incidents.data && incidents.data.length > 0 && (
            <Table
              head={["Tipo", "Descripción"]}
              rows={incidents.data.map((incident) => [incident.incident_type, incident.description])}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
