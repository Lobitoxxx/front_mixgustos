//! Configuración general: app settings list + put (settings.manage).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, dateTime, Field, Input, Loading, Table, useAction, useData,
} from "../../ui/kit";

interface Setting { key: string; value: string; updated_at?: string }

export default function Configuracion() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const settings = useData<Setting[]>(["settings"], "/settings", 15000);

  const put = useAction(
    () => api("/settings", { method: "PUT", body: { key, value } }),
    { ok: "Configuración guardada", invalidate: ["settings"] },
  );

  return (
    <div className="space-y-4">
      <Card title={`Configuración general (${settings.data?.length ?? 0})`}>
        {settings.isLoading ? <Loading /> : (
          <Table
            head={["Clave", "Valor", "Actualizada"]}
            rows={(settings.data ?? []).map((setting) => [
              <code key="k">{setting.key}</code>,
              setting.value,
              dateTime(setting.updated_at),
            ])}
          />
        )}
      </Card>

      <Card title="Guardar clave">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-44"><Field label="Clave"><Input value={key} onChange={(e) => setKey(e.target.value)} /></Field></div>
          <div className="min-w-44"><Field label="Valor"><Input value={value} onChange={(e) => setValue(e.target.value)} /></Field></div>
          <Button busy={put.isPending} disabled={!key.trim()}
            onClick={() => put.mutate(undefined, { onSuccess: () => { setKey(""); setValue(""); } })}>
            Guardar
          </Button>
        </div>
      </Card>
    </div>
  );
}
