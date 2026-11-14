//! Caja: registers, sessions with arqueo detail, movements, reopen (owner).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, dateTime, Field, Input, Loading, money, Modal, Pill, Select,
  Table, useAction, useData,
} from "../../ui/kit";

interface Register { id: string; name: string }
interface Session {
  id: string; register_id: string; status: string; opening_balance: number;
  expected_balance?: number; counted_balance?: number; difference?: number;
  opened_at?: string; closed_at?: string | null;
}
interface Movement { id: string; movement_type: string; amount: number; reason: string; created_at?: string }

export default function Caja() {
  const [openModal, setOpenModal] = useState(false);
  const [registerId, setRegisterId] = useState("");
  const [openingBalance, setOpeningBalance] = useState("100");
  const [detailFor, setDetailFor] = useState<Session | null>(null);
  const [moveType, setMoveType] = useState<null | "in" | "out">(null);
  const [moveAmount, setMoveAmount] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [closeFor, setCloseFor] = useState<Session | null>(null);
  const [counted, setCounted] = useState("");
  const [diffReason, setDiffReason] = useState("");

  const registers = useData<Register[]>(["cash", "registers"], "/cash/registers");
  const sessions = useData<Session[]>(["cash", "sessions"], "/cash/sessions", 10000);
  const movements = useData<Movement[]>(
    ["cash", "movements", detailFor?.id ?? "none"],
    detailFor ? `/cash/sessions/${detailFor.id}/movements` : "",
    undefined,
    !!detailFor,
  );

  const openSession = useAction(
    () => api(`/cash/registers/${registerId || registers.data?.[0]?.id}/sessions`, {
      method: "POST",
      body: { opening_balance: Number(openingBalance) },
    }),
    { ok: "Sesión abierta", invalidate: ["cash"] },
  );
  const addMovement = useAction(
    () => api(`/cash/sessions/${detailFor?.id}/movements`, {
      method: "POST",
      body: { movement_type: moveType, amount: Number(moveAmount), reason: moveReason },
    }),
    { ok: "Movimiento registrado", invalidate: ["cash", "movements"] },
  );
  const closeSession = useAction(
    () => api(`/cash/sessions/${closeFor?.id}/close`, {
      method: "POST",
      body: { counted_balance: Number(counted), difference_reason: diffReason || null },
    }),
    { ok: "Sesión cerrada", invalidate: ["cash"] },
  );
  const reopenSession = useAction(
    (id: string) => api(`/cash/sessions/${id}/reopen`, { method: "POST" }),
    { ok: "Sesión reabierta", invalidate: ["cash"] },
  );

  return (
    <div className="space-y-4">
      <Card
        title="Registros de caja"
        actions={<Button onClick={() => setOpenModal(true)}>Abrir sesión</Button>}
      >
        <Table
          head={["Registro"]}
          rows={(registers.data ?? []).map((register) => [register.name])}
        />
      </Card>

      <Card title="Sesiones">
        {sessions.isLoading ? <Loading /> : (
          <Table
            head={["Sesión", "Registro", "Estado", "Fondo", "Esperado", "Contado", "Dif.", "Cierre", "Acciones"]}
            rows={(sessions.data ?? []).map((session) => [
              <span key="i" className="font-mono text-xs">{session.id.slice(0, 8)}</span>,
              (registers.data ?? []).find((r) => r.id === session.register_id)?.name ?? "—",
              <Pill key="s" value={session.status} />,
              money(session.opening_balance),
              session.expected_balance !== undefined ? money(session.expected_balance) : "—",
              session.counted_balance !== undefined ? money(session.counted_balance) : "—",
              session.difference !== undefined
                ? <b key="d" className={Number(session.difference) !== 0 ? "text-amber-300" : "text-emerald-300"}>{money(session.difference)}</b>
                : "—",
              dateTime(session.closed_at),
              <div key="a" className="flex flex-wrap gap-1.5">
                <Button kind="ghost" onClick={() => setDetailFor(session)}>Movimientos</Button>
                {session.status === "open" && (
                  <Button kind="ghost" onClick={() => { setCloseFor(session); setCounted(""); setDiffReason(""); }}>
                    Cerrar
                  </Button>
                )}
                {session.status === "closed" && (
                  <Button kind="ghost" busy={reopenSession.isPending} onClick={() => reopenSession.mutate(session.id)}>
                    Reabrir
                  </Button>
                )}
              </div>,
            ])}
          />
        )}
      </Card>

      <Modal open={openModal} title="Abrir sesión de caja" onClose={() => setOpenModal(false)}>
        <div className="space-y-3">
          <Field label="Registro">
            <Select value={registerId} onChange={(e) => setRegisterId(e.target.value)}>
              <option value="">(principal)</option>
              {(registers.data ?? []).map((register) => (
                <option key={register.id} value={register.id}>{register.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fondo inicial">
            <Input type="number" min="0" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button busy={openSession.isPending} onClick={() => { openSession.mutate(undefined); setOpenModal(false); }}>
            Abrir
          </Button>
        </div>
      </Modal>

      <Modal open={detailFor !== null} title={`Movimientos · ${detailFor?.id.slice(0, 8) ?? ""}`} onClose={() => setDetailFor(null)}>
        {movements.isLoading ? <Loading /> : (
          <Table
            head={["Tipo", "Monto", "Motivo", "Fecha"]}
            rows={(movements.data ?? []).map((movement) => [
              movement.movement_type,
              money(movement.amount),
              movement.reason,
              dateTime(movement.created_at),
            ])}
          />
        )}
        <div className="mt-3 flex gap-2">
          <Button kind="ghost" onClick={() => setMoveType("in")}>Ingreso</Button>
          <Button kind="ghost" onClick={() => setMoveType("out")}>Salida</Button>
        </div>
      </Modal>

      <Modal open={moveType !== null} title={moveType === "in" ? "Ingreso de efectivo" : "Salida de efectivo"} onClose={() => setMoveType(null)}>
        <div className="space-y-3">
          <Field label="Monto"><Input type="number" min="0" step="0.01" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} /></Field>
          <Field label="Motivo"><Input value={moveReason} onChange={(e) => setMoveReason(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setMoveType(null)}>Cancelar</Button>
          <Button busy={addMovement.isPending} disabled={!moveAmount || !moveReason.trim()}
            onClick={() => { addMovement.mutate(undefined); setMoveType(null); setMoveAmount(""); setMoveReason(""); }}>
            Registrar
          </Button>
        </div>
      </Modal>

      <Modal open={closeFor !== null} title="Cerrar sesión (arqueo)" onClose={() => setCloseFor(null)}>
        <div className="space-y-3">
          <Field label="Efectivo contado">
            <Input type="number" min="0" step="0.01" value={counted} onChange={(e) => setCounted(e.target.value)} />
          </Field>
          {closeFor?.expected_balance !== undefined && counted && (
            <p className="text-sm text-ink-mut">
              Diferencia: <b className={Number(counted) !== closeFor.expected_balance ? "text-amber-300" : "text-emerald-300"}>
                {money(Number(counted) - closeFor.expected_balance)}
              </b>
            </p>
          )}
          <Field label="Motivo de la diferencia (si la hay)">
            <Input value={diffReason} onChange={(e) => setDiffReason(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setCloseFor(null)}>Cancelar</Button>
          <Button busy={closeSession.isPending} disabled={!counted}
            onClick={() => closeSession.mutate(undefined, { onSuccess: () => setCloseFor(null) })}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
