//! Fullscreen hero: looping video with a soft dark overlay, top-aligned
//! headline and two CTAs (design ref: flowpath hero, adapted to the brand).

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260703_053131_1ec3dd1c-d627-44fb-ab20-6e1fce41b0d5.mp4";

export default function Hero({ onLogin, nav }: { onLogin: () => void; nav?: React.ReactNode }) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/10" />
      {/* Bottom fade into the page body */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sand-950 to-transparent" />

      {/* Floating nav over the video */}
      {nav && <div className="absolute inset-x-0 top-0 z-30">{nav}</div>}

      {/* Content: top-aligned under the nav, like the reference design */}
      <div className="relative z-20 flex h-full flex-col">
        <div className="flex-1" style={{ flexGrow: 0.6 }} />
        <div className="flex items-start justify-center px-5">
          <div className="animate-slide-up max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Restaurante · Miraflores
            </p>
            <h1 className="text-4xl leading-[1.03] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Sabores que
              <br />
              <span className="text-white/60">se recuerdan.</span>{" "}
              <span className="text-white/60">Gestión que</span>
              <br />
              funciona.
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:mt-8 sm:text-base md:text-lg">
              MixGustos es el restaurante y, al mismo tiempo, el sistema que
              ordena su cocina: carta viva, inventario fresco y cada pedido bajo
              control.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
              <a
                href="#carta"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-white/90 sm:px-6 sm:py-3"
              >
                Descubre la carta
              </a>
              <button
                onClick={onLogin}
                className="liquid-glass rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-6 sm:py-3"
              >
                Ingresar al sistema
              </button>
            </div>
          </div>
        </div>
        {/* Scroll hint */}
        <div className="flex flex-1 items-end justify-center pb-8">
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
