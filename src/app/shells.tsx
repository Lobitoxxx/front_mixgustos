//! Adaptive shells: A (administrative, sidebar → drawer on mobile),
//! B (operative, single task), D (kitchen/dispatch boards, fullscreen).
//! Navigation is filtered by the session's effective permissions and every
//! shell is responsive (desktop, laptop, tablet, phone).

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NAV, type Experiencia } from "../nav/config";

function useNavEntries(experiencia: Experiencia) {
  const { hasPermission } = useAuth();
  return NAV[experiencia].filter((entry) => !entry.perm || hasPermission(entry.perm));
}

const EXPERIENCIA_LABEL: Record<Experiencia, string> = {
  admin: "Administración",
  op: "Operación",
  kitchen: "Cocina",
};

function Header({ experiencia, onMenu, showMenu = true }: { experiencia: Experiencia; onMenu: () => void; showMenu?: boolean }) {
  const { me, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-2 border-b border-ink-line bg-ink-800 px-3 py-2 sm:gap-3 sm:px-4">
      {/* Drawer toggle on narrow screens */}
      {showMenu && (
        <button
          onClick={onMenu}
          className="rounded-md p-2 text-ink-txt hover:bg-ink-700 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}
      <span className="whitespace-nowrap font-bold text-brand-500">🍅 MixGustos</span>
      <span className="hidden rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white sm:inline">
        {EXPERIENCIA_LABEL[experiencia]}
      </span>
      <div className="flex-1" />
      <span className="truncate text-xs text-ink-mut">
        {me?.display_name}
        <span className="hidden md:inline"> · {me?.roles.join(", ")}</span>
      </span>
      <button
        onClick={async () => {
          await logout();
          navigate("/login", { replace: true });
        }}
        className="whitespace-nowrap rounded-md border border-ink-line px-2.5 py-1.5 text-xs text-ink-txt hover:bg-ink-700 sm:px-3"
      >
        Salir
      </button>
    </header>
  );
}

const linkClass = (isActive: boolean) =>
  `block rounded-md px-3 py-2.5 text-sm transition-colors ${
    isActive ? "bg-brand-600 text-white" : "text-ink-mut hover:bg-ink-700 hover:text-ink-txt"
  }`;

/** Sidebar on ≥lg; slide-in drawer with overlay below that. */
function SidebarShell({ experiencia }: { experiencia: Experiencia }) {
  const entries = useNavEntries(experiencia);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-txt">
      <Header experiencia={experiencia} onMenu={() => setDrawerOpen(true)} />
      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <nav className="hidden w-56 shrink-0 space-y-1 overflow-y-auto border-r border-ink-line bg-ink-800 p-3 lg:block">
          {entries.map((entry) => (
            <NavLink key={entry.path} to={entry.path} end className={({ isActive }) => linkClass(isActive)}>
              {entry.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setDrawerOpen(false)}>
            <div className="animate-fade absolute inset-0 bg-black/60" />
            <div
              className="absolute inset-y-0 left-0 w-64 overflow-y-auto border-r border-ink-line bg-ink-800 p-3 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-mut">
                  {EXPERIENCIA_LABEL[experiencia]}
                </span>
                <button onClick={() => setDrawerOpen(false)} className="p-1 text-ink-mut hover:text-ink-txt" aria-label="Cerrar menú">
                  <X size={18} />
                </button>
              </div>
              {entries.map((entry) => (
                <NavLink
                  key={entry.path}
                  to={entry.path}
                  end
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  {entry.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Horizontal task tabs; scrollable on narrow screens with hidden scrollbar. */
function TopTabsShell({ experiencia }: { experiencia: Experiencia }) {
  const entries = useNavEntries(experiencia);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-txt">
      <Header experiencia={experiencia} onMenu={() => {}} showMenu={false} />
      <nav className="flex gap-2 overflow-x-auto border-b border-ink-line bg-ink-800 px-3 py-2">
        {entries.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md border px-3 py-2 text-sm transition-colors ${
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
      <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5">
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
      <Header experiencia="kitchen" onMenu={() => {}} showMenu={false} />
      <nav className="flex gap-3 overflow-x-auto border-b border-ink-line bg-ink-800 px-4 py-3">
        {entries.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg border px-4 py-2 text-base font-medium transition-colors ${
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
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
