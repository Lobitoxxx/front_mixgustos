//! Adaptive shells: A (administrative, sidebar → drawer on mobile),
//! B (operative, single task), D (kitchen/dispatch boards, fullscreen).
//! Shared warm design language with the public site; navigation filtered by
//! the session's effective permissions.

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NAV, experienciasDisponibles, type Experiencia } from "../nav/config";
import Logo from "../features/public/Logo";

function useNavEntries(experiencia: Experiencia) {
  const { hasPermission } = useAuth();
  return NAV[experiencia].filter((entry) => !entry.perm || hasPermission(entry.perm));
}

const EXPERIENCIA_LABEL: Record<Experiencia, string> = {
  admin: "Administración",
  op: "Operación",
  kitchen: "Cocina",
};

/** Header switcher: every experience the session can open, as glass pills.
 *  Shown only when the session qualifies for more than one. */
function ExperienciaSwitcher({ actual }: { actual: Experiencia }) {
  const { me } = useAuth();
  const disponibles = experienciasDisponibles(me?.permissions ?? []).filter(
    (exp) => exp !== actual,
  );
  if (disponibles.length === 0) return null;
  return (
    <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 sm:flex">
      {([actual, ...disponibles] as Experiencia[]).map((exp) => (
        <NavLink
          key={exp}
          to={`/${exp}`}
          end
          className={({ isActive }) =>
            `press whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              isActive
                ? "bg-brand-600 text-white shadow-sm shadow-brand-700/30"
                : "text-ink-mut hover:text-ink-txt"
            }`
          }
        >
          {EXPERIENCIA_LABEL[exp]}
        </NavLink>
      ))}
    </div>
  );
}

function Header({ experiencia, onMenu, showMenu = true }: { experiencia: Experiencia; onMenu: () => void; showMenu?: boolean }) {
  const { me, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="glass-nav flex items-center gap-2 border-b border-white/10 bg-ink-900/60 px-3 py-2.5 sm:gap-3 sm:px-4">
      {showMenu && (
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-ink-txt hover:bg-ink-700 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}
      <NavLink to="/" className="flex items-center gap-1.5 text-ink-txt" title="Volver a la web del restaurante">
        <Logo size={22} />
        <span className="hidden whitespace-nowrap text-sm font-semibold tracking-tight sm:inline">mixgustos</span>
      </NavLink>
      <ExperienciaSwitcher actual={experiencia} />
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
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink-line px-3 py-1.5 text-xs text-ink-txt transition-colors hover:border-brand-500/60 hover:text-white"
      >
        <LogOut size={13} /> Salir
      </button>
    </header>
  );
}

const linkClass = (isActive: boolean) =>
  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
    isActive
      ? "bg-brand-600 font-medium text-white shadow-md shadow-brand-700/30"
      : "text-ink-mut hover:bg-ink-700/60 hover:text-ink-txt"
  }`;

function BrandBlock() {
  return (
    <div className="mb-3 hidden px-2 lg:block">
      <div className="glass-card rounded-2xl p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-500">Sistema</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-mut">
          Gestión integral de cocina, salón, despensa y finanzas.
        </p>
      </div>
    </div>
  );
}

/** Sidebar on ≥lg; slide-in drawer with overlay below that. */
function SidebarShell({ experiencia }: { experiencia: Experiencia }) {
  const entries = useNavEntries(experiencia);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-txt">
      <Header experiencia={experiencia} onMenu={() => setDrawerOpen(true)} />
      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <nav className="glass-nav hidden w-60 shrink-0 space-y-1 overflow-y-auto border-r border-white/8 p-3 lg:block">
          <BrandBlock />
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
              className="glass-nav absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-white/10 bg-ink-800/90 p-3 shadow-2xl"
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

        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/** Horizontal task tabs; scrollable on narrow screens. */
function TopTabsShell({ experiencia }: { experiencia: Experiencia }) {
  const entries = useNavEntries(experiencia);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-ink-txt">
      <Header experiencia={experiencia} onMenu={() => {}} showMenu={false} />
      <nav className="glass-nav flex gap-2 overflow-x-auto border-b border-white/8 px-3 py-2">
        {entries.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? "border-brand-500 bg-brand-600 font-medium text-white"
                  : "border-ink-line text-ink-mut hover:border-brand-500/50 hover:text-ink-txt"
              }`
            }
          >
            {entry.label}
          </NavLink>
        ))}
      </nav>
      <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
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
    <div className="flex h-screen flex-col bg-[#140f0a] text-ink-txt">
      <Header experiencia="kitchen" onMenu={() => {}} showMenu={false} />
      <nav className="glass-nav flex gap-3 overflow-x-auto border-b border-white/8 px-4 py-3">
        {entries.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-xl border px-4 py-2 text-base font-medium transition-all duration-200 ${
                isActive
                  ? "border-brand-500 bg-brand-600 text-white shadow-md shadow-brand-700/30"
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
