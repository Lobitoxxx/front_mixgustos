//! Module placeholder used across F1: states the module's scope and the
//! phase that will implement it, while the shell and permissions are proven.

import { useLocation } from "react-router-dom";
import { NAV, type Experiencia, type NavEntry } from "../nav/config";

const LABEL: Record<Experiencia, string> = {
  admin: "Administración",
  op: "Operación",
  kitchen: "Cocina",
};

export default function Modulo({ experiencia }: { experiencia: Experiencia }) {
  const location = useLocation();
  const entry = NAV[experiencia].find((candidate) => candidate.path === location.pathname);

  return <Placeholder entry={entry} experiencia={experiencia} />;
}

function Placeholder({ entry, experiencia }: { entry: NavEntry | undefined; experiencia: Experiencia }) {
  if (!entry) {
    return (
      <div className="rounded-xl border border-ink-line bg-ink-800 p-6 text-ink-mut">
        Módulo no registrado en la navegación ({LABEL[experiencia]}).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">{entry.label}</h1>
        <p className="text-sm text-ink-mut">{entry.desc}</p>
      </div>
      <div className="rounded-xl border border-ink-line bg-ink-800 p-6">
        <p className="text-lg font-semibold">Pantalla en construcción</p>
        <p className="mt-2 text-sm text-ink-mut">
          Esta ventana pertenece a la{" "}
          <span className="font-semibold text-ink-txt">Fase {entry.fase}</span> del plan frontend
          ({entry.fase === 2 ? "experiencia operativa" : "experiencia administrativa"}).
        </p>
        {entry.perm && (
          <p className="mt-3 text-xs text-ink-mut">
            Permiso que la habilita: <code className="rounded bg-ink-700 px-1">{entry.perm}</code>
          </p>
        )}
      </div>
    </div>
  );
}
