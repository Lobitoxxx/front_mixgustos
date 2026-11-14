//! Resumen of the administrative experience: who is operating, their roles,
//! permission count and the modules the session can actually use.

import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { NavEntry } from "../nav/config";

interface OutletData {
  entries: NavEntry[];
}

export default function Resumen() {
  const { me } = useAuth();
  const { entries } = useOutletContext<OutletData>();
  const modules = entries.filter((entry) => entry.path !== "/admin");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Resumen</h1>
        <p className="text-sm text-ink-mut">
          {me?.display_name} · {me?.roles.join(", ")} · {me?.permissions.length} permisos efectivos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Módulos habilitados" value={String(modules.length)} />
        <Kpi label="Roles de la sesión" value={String(me?.roles.length ?? 0)} />
        <Kpi label="Permisos efectivos" value={String(me?.permissions.length ?? 0)} />
        <Kpi label="Notificaciones" value="—" />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-mut">
          Accesos directos
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="rounded-lg border border-ink-line bg-ink-800 p-4 hover:border-brand-500"
            >
              <p className="font-semibold">{module.label}</p>
              <p className="mt-1 text-xs text-ink-mut">{module.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-line bg-ink-800 p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-ink-mut">{label}</p>
    </div>
  );
}
