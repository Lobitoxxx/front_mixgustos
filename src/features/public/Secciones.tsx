//! Site footer with contact, hours, social hints and legal links.

export function Contacto({ onOpenTerms }: { onOpenTerms: () => void }) {
  return (
    <footer id="contacto" className="scroll-mt-16 border-t border-sand-line/50 bg-sand-950 px-5 py-14 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold tracking-tight text-sand-txt">mixgustos</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-sand-mut">
            Cocina peruana de temporada con un sistema propio que conecta
            mesa, cocina, despensa y caja. Come bien — y detrás, todo ordenado.
          </p>
          <p className="mt-4 flex flex-wrap gap-2 text-xs text-sand-mut">
            <span className="rounded-full border border-sand-line px-3 py-1">Av. Sabores 210, Miraflores</span>
            <span className="rounded-full border border-sand-line px-3 py-1">(01) 555-0870</span>
            <span className="rounded-full border border-sand-line px-3 py-1">hola@mixgustos.pe</span>
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-txt">Horarios</h4>
          <p className="mt-3 text-sm leading-relaxed text-sand-mut">
            Lunes a sábado<br />
            12:00 – 23:00
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sand-mut">
            Domingos<br />
            12:00 – 17:00
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-txt">Sitio</h4>
          <ul className="mt-3 space-y-2 text-sm text-sand-mut">
            <li><a href="#restaurante" className="hover:text-sand-txt">El restaurante</a></li>
            <li><a href="#carta" className="hover:text-sand-txt">La carta</a></li>
            <li><a href="#sistema" className="hover:text-sand-txt">El sistema</a></li>
            <li><button onClick={onOpenTerms} className="hover:text-sand-txt">Términos y condiciones</button></li>
            <li><button onClick={onOpenTerms} className="hover:text-sand-txt">Política de cookies</button></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-sand-line/40 pt-6 text-xs text-sand-mut">
        <span>© {new Date().getFullYear()} MixGustos — Sistema de gestión para restaurantes.</span>
        <span>Demo del portal de clientes en construcción.</span>
      </div>
    </footer>
  );
}
