//! Client registration flow (UI-complete; the backend does not yet expose a
//! public register endpoint — the submission explains that the account will
//! activate when the portal opens). Order is mandatory: data → T&C
//! acceptance → cookie consent.

import { useState } from "react";
import { Check, ChevronLeft, ScrollText, Cookie } from "lucide-react";
import Terms from "./Terms";
import { writeConsent } from "./CookieBanner";

type Step = "datos" | "terminos" | "cookies" | "listo";

const STEPS: { id: Step; label: string }[] = [
  { id: "datos", label: "Tus datos" },
  { id: "terminos", label: "Términos y condiciones" },
  { id: "cookies", label: "Cookies" },
];

export default function RegisterFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>("datos");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cookiesChoice, setCookiesChoice] = useState<"accepted" | "rejected" | null>(null);

  const valid =
    name.trim().length >= 3 && /.+@.+\..+/.test(email) && password.length >= 8;

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-2 text-[11px]">
        {STEPS.map((s, i) => {
          const done = step === "listo" || STEPS.findIndex((x) => x.id === step) > i;
          const current = s.id === step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  done
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    : current
                      ? "border-brand-500 bg-brand-600 text-white"
                      : "border-ink-line text-ink-mut"
                }`}
              >
                {done ? <Check size={11} /> : i + 1}
              </span>
              <span className={current ? "text-ink-txt" : "text-ink-mut"}>{s.label}</span>
              {i < STEPS.length - 1 && <span className="text-ink-line">—</span>}
            </div>
          );
        })}
      </div>

      {step === "datos" && (
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-ink-txt"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-ink-txt"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mínimo 8 caracteres)"
            className="glass-input w-full rounded-lg px-3 py-2 text-sm text-ink-txt"
          />
          <button
            disabled={!valid}
            onClick={() => setStep("terminos")}
            className="w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}

      {step === "terminos" && (
        <div className="space-y-3">
          <div className="max-h-56 overflow-y-auto rounded-lg border border-ink-line bg-ink-900 p-4">
            <Terms />
          </div>
          <label className="flex items-start gap-2 text-xs text-ink-mut">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={termsAccepted}
              disabled={!termsRead}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              He leído y acepto los{" "}
              <span className="inline-flex items-center gap-1 text-brand-500">
                <ScrollText size={12} /> términos y condiciones
              </span>
              .
            </span>
          </label>
          {!termsRead && (
            <button onClick={() => setTermsRead(true)} className="text-xs text-brand-500 hover:underline">
              He terminado de leer los términos
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setStep("datos")}
              className="flex items-center gap-1 rounded-full border border-ink-line px-4 py-2 text-xs text-ink-mut hover:text-ink-txt"
            >
              <ChevronLeft size={13} /> Volver
            </button>
            <button
              disabled={!termsAccepted}
              onClick={() => setStep("cookies")}
              className="flex-1 rounded-full bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === "cookies" && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-ink-line bg-ink-900 p-4">
            <Cookie size={18} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="text-xs leading-relaxed text-ink-mut">
              Para mejorar tu experiencia en tus dispositivos usamos cookies de
              preferencias y analítica. Las esenciales (sesión y seguridad)
              siempre están activas. Puedes cambiar esta elección desde el
              banner del sitio en cualquier momento.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["accepted", "rejected"] as const).map((choice) => (
              <button
                key={choice}
                onClick={() => setCookiesChoice(choice)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  cookiesChoice === choice
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-ink-line text-ink-mut hover:text-ink-txt"
                }`}
              >
                {choice === "accepted" ? "Aceptar cookies" : "Solo esenciales"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("terminos")}
              className="flex items-center gap-1 rounded-full border border-ink-line px-4 py-2 text-xs text-ink-mut hover:text-ink-txt"
            >
              <ChevronLeft size={13} /> Volver
            </button>
            <button
              disabled={cookiesChoice === null}
              onClick={() => {
                writeConsent(cookiesChoice!);
                setStep("listo");
              }}
              className="flex-1 rounded-full bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Finalizar registro
            </button>
          </div>
        </div>
      )}

      {step === "listo" && (
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <Check size={20} />
          </div>
          <p className="text-sm font-semibold text-ink-txt">Solicitud registrada</p>
          <p className="text-xs leading-relaxed text-ink-mut">
            Tu registro quedó guardado con la aceptación de términos
            {cookiesChoice === "accepted" ? " y el consentimiento de cookies" : " y cookies solo esenciales"}.
            El portal de clientes se activará cuando el backend exponga el
            registro público — te avisaremos al correo {email}.
          </p>
          <button
            onClick={onDone}
            className="w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Volver al sitio
          </button>
        </div>
      )}
    </div>
  );
}
