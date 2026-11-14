//! Administrative dashboard: session identity, live KPIs (modules, roles,
//! permissions, unread notifications) and quick access to every module the
//! session can actually open. Same warm design language as the public site.

import { Link } from "react-router-dom";
import {
  BellRing, ChevronRight, LayoutGrid, ShieldCheck, Sparkles, Users,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NAV, type NavEntry } from "../nav/config";
import { useData } from "../ui/kit";

export default function Resumen() {
  const { me, hasPermission } = useAuth();
  const entries: NavEntry[] = NAV.admin.filter(
    (entry) => entry.path !== "/admin" && (!entry.perm || hasPermission(entry.perm)),
  );

  const inbox = useData<{ id: string; read_at: string | null }[]>(
    ["notifications", "dashboard"],
    "/notifications",
    10000,
  );
  const unread = (inbox.data ?? []).filter((notification) => notification.read_at === null).length;

  if (!me) return null;

  return (
    <div className="space-y-6">
      {/* ── Welcome band ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-line bg-gradient-to-br from-ink-800 via-ink-800 to-brand-700/20 p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl" />
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          <Sparkles size={13} /> Panel del día
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Hola, {me.display_name.split(" ")[0]}
        </h1>
        <p className="mt-1.5 max-w-md text-sm text-ink-mut">
          {me.roles.join(" · ")} — con acceso a {entries.length} módulos y{" "}
          {me.permissions.length} permisos efectivos.
        </p>
      </div>

      {/* ── Live KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={<LayoutGrid size={16} />}
          label="Módulos habilitados"
          value={String(entries.length)}
          hint="según tu rol"
        />
        <Kpi
          icon={<Users size={16} />}
          label="Roles de la sesión"
          value={String(me.roles.length)}
          hint={me.roles.join(", ")}
        />
        <Kpi
          icon={<ShieldCheck size={16} />}
          label="Permisos efectivos"
          value={String(me.permissions.length)}
          hint="aplicados por el backend"
        />
        <Kpi
          icon={<BellRing size={16} />}
          label="Notificaciones sin leer"
          value={inbox.error ? "—" : String(unread)}
          hint={inbox.error ? "requiere sesión activa" : "bandeja personal"}
        />
      </div>

      {/* ── Quick access ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mut">
            Accesos directos
          </h2>
          <span className="text-xs text-ink-mut">solo lo que puedes abrir</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="glass-card lift group rounded-2xl p-4 hover:shadow-brand-700/10"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink-txt">{module.label}</p>
                <ChevronRight
                  size={16}
                  className="text-ink-mut transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand-500"
                />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-mut">{module.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon, label, value, hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 text-brand-500">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-txt">{value}</p>
      <p className="text-xs text-ink-mut">{label}</p>
      <p className="mt-1 truncate text-[11px] text-ink-mut/70">{hint}</p>
    </div>
  );
}
