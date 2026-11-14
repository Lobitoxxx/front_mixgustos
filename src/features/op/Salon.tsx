//! Salón: areas + tables with their live status, mozo assignment (self) and
//! cleaning confirmation. Status changes go through the dining state machine.

import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Pill, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Area { id: string; name: string; description?: string | null }
interface Table {
  id: string; area_id: string; code: string; seats: number; status: string;
  assigned_to?: string | null;
}

export default function Salon() {
  const { me, hasPermission } = useAuth();
  const [selectedArea, setSelectedArea] = useState<string>("");

  const areas = useData<Area[]>(["dining", "areas"], "/dining/areas", 10000);
  const tables = useData<Table[]>(["dining", "tables"], "/dining/tables", 8000);

  const createArea = useAction(
    () => api("/dining/areas", { method: "POST", body: { name: newArea, description: null } }),
    { ok: "Área creada", invalidate: ["dining"] },
  );
  const createTable = useAction(
    () => api("/dining/tables", {
      method: "POST",
      body: { area_id: selectedArea, code: newTableCode, seats: Number(newTableSeats) || 4 },
    }),
    { ok: "Mesa creada", invalidate: ["dining"] },
  );
  const setStatus = useAction(
    (args: { id: string; target: string; expected?: string }) =>
      api(`/dining/tables/${args.id}/status`, { method: "POST", body: { target: args.target, expected: args.expected } }),
    { ok: "Estado de mesa actualizado", invalidate: ["dining"] },
  );
  const assignSelf = useAction(
    (tableId: string) => api(`/dining/tables/${tableId}/assign`, { method: "POST", body: { user_id: me?.id } }),
    { ok: "Mesa asignada", invalidate: ["dining"] },
  );
  const confirmCleaning = useAction(
    (tableId: string) => api(`/dining/tables/${tableId}/confirm-cleaning`, { method: "POST" }),
    { ok: "Limpieza confirmada", invalidate: ["dining"] },
  );

  const [newArea, setNewArea] = useState("");
  const [newTableCode, setNewTableCode] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("4");

  const visibleTables = (tables.data ?? []).filter(
    (table) => !selectedArea || table.area_id === selectedArea,
  );
  const canManage = hasPermission("tables.assign");

  if (areas.error) return <Loading error={areas.error} />;

  return (
    <div className="space-y-4">
      <Card title="Áreas">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-40">
            <Field label="Área">
              <Select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                <option value="">Todas las áreas</option>
                {(areas.data ?? []).map((area) => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          {canManage && (
            <>
              <div className="min-w-40">
                <Field label="Nueva área">
                  <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Ej. Salón principal" />
                </Field>
              </div>
              <Button busy={createArea.isPending} disabled={!newArea.trim()}
                onClick={() => createArea.mutate(undefined)}>
                Crear área
              </Button>
              <div className="min-w-32">
                <Field label="Mesa (código)">
                  <Input value={newTableCode} onChange={(e) => setNewTableCode(e.target.value)} placeholder="Ej. M-12" />
                </Field>
              </div>
              <div className="w-24">
                <Field label="Sillas">
                  <Input type="number" min="1" value={newTableSeats} onChange={(e) => setNewTableSeats(e.target.value)} />
                </Field>
              </div>
              <Button busy={createTable.isPending}
                disabled={!newTableCode.trim() || !selectedArea}
                onClick={() => { createTable.mutate(undefined); setNewTableCode(""); }}>
                Crear mesa
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card title="Mesas">
        {tables.isLoading ? <Loading /> : (
          <Table
            head={["Código", "Sillas", "Estado", "Acciones"]}
            rows={visibleTables.map((table) => [
              <span key="c" className="font-semibold">{table.code}</span>,
              table.seats,
              <Pill key="s" value={table.status} />,
              <div key="a" className="flex flex-wrap gap-1.5">
                {table.status === "available" && canManage && (
                  <Button kind="ghost" busy={assignSelf.isPending}
                    onClick={() => assignSelf.mutate(table.id)}>Asignarme</Button>
                )}
                {table.status === "available" && canManage && (
                  <Button kind="ghost" busy={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: table.id, target: "reserved" })}>Reservar</Button>
                )}
                {table.status === "waiting_cleaning" && (
                  <Button kind="ghost" busy={confirmCleaning.isPending}
                    onClick={() => confirmCleaning.mutate(table.id)}>Confirmar limpieza</Button>
                )}
                {table.status === "available" && canManage && (
                  <Button kind="ghost" busy={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: table.id, target: "waiting_cleaning", expected: "available" })}>
                    A limpieza
                  </Button>
                )}
              </div>,
            ])}
          />
        )}
        <p className="mt-3 text-xs text-ink-mut">
          La mesa ocupada se libera al cobrar la cuenta; el estado{" "}
          <code>waiting_cleaning</code> vuelve a <code>available</code> confirmando la limpieza.
        </p>
      </Card>
    </div>
  );
}
