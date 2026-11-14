//! Notificaciones: personal inbox with read marking, broadcast to staff,
//! preferences and the manual alert sweep (notifications.manage).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, dateTime, Field, Input, Loading, Modal, Pill, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Notification {
  id: string; code: string; severity: string; title: string; body: string;
  created_at?: string; read_at?: string | null;
}

export default function Notificaciones() {
  const [onlyUnread, setOnlyUnread] = useState(true);
  const [prefCode, setPrefCode] = useState("stock.low");
  const [prefEnabled, setPrefEnabled] = useState("true");
  const [bcOpen, setBcOpen] = useState(false);
  const [bcTitle, setBcTitle] = useState("");
  const [bcBody, setBcBody] = useState("");

  const inbox = useData<Notification[]>(
    ["notifications", onlyUnread],
    `/notifications${onlyUnread ? "?unread_only=true" : ""}`,
    10000,
  );

  const markRead = useAction(
    (id: string) => api(`/notifications/${id}/read`, { method: "POST" }),
    { ok: "Marcada como leída", invalidate: ["notifications"] },
  );
  const broadcast = useAction(
    () => api("/notifications/broadcast", {
      method: "POST",
      body: { code: "broadcast", severity: "info", title: bcTitle, body: bcBody },
    }),
    { ok: "Difusión enviada", invalidate: ["notifications"] },
  );
  const sweep = useAction(
    () => api("/notifications/sweep", { method: "POST" }),
    { ok: "Barredor ejecutado", invalidate: ["notifications"] },
  );
  const setPreference = useAction(
    () => api("/notifications/preferences", {
      method: "POST",
      body: { code: prefCode, enabled: prefEnabled === "true" },
    }),
    { ok: "Preferencia guardada", invalidate: ["notifications"] },
  );

  return (
    <div className="space-y-4">
      <Card
        title={`Bandeja (${inbox.data?.length ?? 0})`}
        actions={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-ink-mut">
              <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
              Solo sin leer
            </label>
            <Button kind="ghost" onClick={() => setBcOpen(true)}>Difusión</Button>
            <Button kind="ghost" busy={sweep.isPending} onClick={() => sweep.mutate(undefined)}>Barrer alertas</Button>
          </div>
        }
      >
        {inbox.isLoading ? <Loading /> : (
          <Table
            head={["Severidad", "Título", "Detalle", "Fecha", ""]}
            rows={(inbox.data ?? []).map((notification) => [
              <Pill key="s" value={notification.severity} />,
              <b key="t">{notification.title}</b>,
              notification.body,
              dateTime(notification.created_at),
              notification.read_at === null && (
                <Button key="b" kind="ghost" busy={markRead.isPending} onClick={() => markRead.mutate(notification.id)}>
                  Leída
                </Button>
              ),
            ])}
          />
        )}
      </Card>

      <Card title="Preferencias por código">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-40">
            <Field label="Código">
              <Select value={prefCode} onChange={(e) => setPrefCode(e.target.value)}>
                <option value="stock.low">stock.low</option>
                <option value="lot.expiring">lot.expiring</option>
                <option value="broadcast">broadcast</option>
              </Select>
            </Field>
          </div>
          <div className="w-32">
            <Field label="Habilitado">
              <Select value={prefEnabled} onChange={(e) => setPrefEnabled(e.target.value)}>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </Select>
            </Field>
          </div>
          <Button busy={setPreference.isPending} onClick={() => setPreference.mutate(undefined)}>Guardar</Button>
        </div>
      </Card>

      <Modal open={bcOpen} title="Difusión a todo el personal" onClose={() => setBcOpen(false)}>
        <div className="space-y-3">
          <Field label="Título"><Input value={bcTitle} onChange={(e) => setBcTitle(e.target.value)} /></Field>
          <Field label="Mensaje"><Input value={bcBody} onChange={(e) => setBcBody(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setBcOpen(false)}>Cancelar</Button>
          <Button busy={broadcast.isPending} disabled={!bcTitle.trim() || !bcBody.trim()}
            onClick={() => broadcast.mutate(undefined, { onSuccess: () => setBcOpen(false) })}>
            Enviar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
