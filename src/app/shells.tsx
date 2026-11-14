//! Adaptive shells: A (administrative, sidebar), B (operative, single task),
//! D (kitchen/dispatch boards, fullscreen). Navigation is filtered by the
//! session's effective permissions.

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { NAV, type Experiencia } from "../nav/config";

function useNavEntries(experiencia: Experiencia) {
  const { hasPermission } = useAuth();
  return NAV[experiencia].filter((entry) => !entry.perm || hasPermission(entry.perm));
}

function Header({ experiencia }: { experiencia: Experiencia }) {
  const { me, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 border-b border-ink-line bg-ink-800 px-4 py-2">
      <span className="font-bold text-brand-500">🍅 MixGustos</span>
      <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
        {experiencia === "admin" ? "Administración" : experiencia === "op" ? "Operación" : "Cocina"}
      </span>
      <div className="flex-1" />
      <span className="text-xs text-ink-mut">
        {me?.display_name} · {me?.roles.join(", ")}
      </span>
      <button
        onClick={async () => {
          await logout();
          navigate("/login", { replace: true });
        }}
        className="rounded-md border border-ink-line px-3 py-1 text-xs text-ink-txt hover:bg-ink-700"
      >
        Salir
      </button>
    </header>
  );
}

function SidebarShell({ experiencia }: { experiencia: Experiencia }) {
  const entries = useNavEntries(experiencia);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-txt">
      <Header experiencia={experiencia} />
      <div className="flex min-h-0 flex-1">
        <nav className="w-56 shrink-0 space-y-1 overflow-y-auto border-r border-ink-line bg-ink-800 p-3">
          {entries.map((entry) => (
            <NavLink
              key={entry.path}
              to={entry.path}
              end
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-brand-600 text-white" : "text-ink-mut hover:bg-ink-700 hover:text-ink-txt"
                }`
              }
            >
              {entry.label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TopTabsShell({ experiencia }: { experiencia: Experiencia }) {
  const entries = useNavEntries(experiencia);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-txt">
      <Header experiencia={experiencia} />
      <nav className="flex gap-2 border-b border-ink-line bg-ink-800 px-3 py-2">
        {entries.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end
            className={({ isActive }) =>
              `rounded-md border px-3 py-1.5 text-sm ${
                isActive
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-line text-ink-mut hover:text-ink-txt"
              }`
            }
          >
            {entry.label}
          </NavLink>
        ))}
      </nav>
      <main className="min-w-0 flex-1 overflow-y-auto p-5">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminShell() {
  return <SidebarShell experiencia="admin" />;
}

export function OpShell() {
  return <TopTabsShell experiencia="op" />;
}

/** Kitchen boards use larger type and a darker canvas for wall screens. */
export function KitchenShell() {
  const entries = useNavEntries("kitchen");

  return (
    <div className="flex h-screen flex-col bg-[#0a0e17] text-ink-txt">
      <Header experiencia="kitchen" />
      <nav className="flex gap-3 border-b border-ink-line bg-ink-800 px-4 py-3">
        {entries.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end
            className={({ isActive }) =>
              `rounded-lg border px-4 py-2 text-base font-medium ${
                isActive
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-ink-line text-ink-mut hover:text-ink-txt"
              }`
            }
          >
            {entry.label}
          </NavLink>
        ))}
      </nav>
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <Outlet context={{ entries }} />
      </main>
    </div>
  );
}
