//! Landing navigation: desktop dropdowns on hover (liquid glass), animated
//! mobile menu, and the access points — "Ingresar" opens the login modal.

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const ITEMS: NavItem[] = [
  {
    label: "El Restaurante",
    href: "#restaurante",
    children: [
      { label: "Nuestra historia", href: "#restaurante" },
      { label: "Especialidad", href: "#restaurante" },
      { label: "Galería", href: "#restaurante" },
    ],
  },
  {
    label: "La Carta",
    href: "#carta",
    children: [
      { label: "Entradas y platos", href: "#carta" },
      { label: "Postres y bebidas", href: "#carta" },
    ],
  },
  {
    label: "El Sistema",
    href: "#sistema",
    children: [
      { label: "Cómo trabajamos", href: "#sistema" },
      { label: "Módulos", href: "#sistema" },
    ],
  },
  { label: "Contacto", href: "#contacto" },
];

export default function LandingNav({ onLogin }: { onLogin: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative z-30 w-full px-5 py-4 sm:px-6 sm:py-5 md:px-12 lg:px-16">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-white">
          <Logo />
          <span className="text-lg font-medium tracking-tight sm:text-xl">mixgustos</span>
        </a>

        {/* Desktop items */}
        <div className="hidden items-center gap-1 md:flex">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpen(item.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <a
                href={item.href}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {item.label}
                {item.children && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${open === item.label ? "rotate-180" : ""}`}
                  />
                )}
              </a>
              {item.children && open === item.label && (
                <div className="liquid-glass !absolute left-0 top-full z-40 min-w-[180px] animate-dropdown rounded-xl px-2 py-3 shadow-xl">
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      className="block rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onLogin}
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            Ingresar
          </button>
          <a
            href="#carta"
            className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Ver la carta
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="relative text-white md:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span
            className={`block transition-transform duration-300 ${mobileOpen ? "rotate-90 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
          >
            <X size={24} />
          </span>
          <span
            className={`absolute transition-transform duration-300 ${mobileOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
          >
            <Menu size={24} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute left-4 right-4 top-full z-40 overflow-hidden rounded-2xl bg-sand-900/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-400 md:hidden ${
          mobileOpen ? "max-h-[560px] translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="space-y-1">
          {ITEMS.map((item) => (
            <div key={item.label}>
              <a
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
              {item.children && (
                <div className="ml-4 border-l border-white/10 pl-3">
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => { setMobileOpen(false); onLogin(); }}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/90"
          >
            Ingresar al sistema
          </button>
          <a
            href="#carta"
            onClick={() => setMobileOpen(false)}
            className="liquid-glass rounded-full px-5 py-2.5 text-center text-sm font-medium text-white"
          >
            Ver la carta
          </a>
        </div>
      </div>
    </nav>
  );
}
