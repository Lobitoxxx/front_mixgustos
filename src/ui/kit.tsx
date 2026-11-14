//! Shared UI kit: cards, tables, form fields, pills, toasts, modals and a
//! mutation helper. Small on purpose — consistent over complete.

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api/client";

// ── Toasts ───────────────────────────────────────────────────────────────────

interface Toast { id: number; text: string; ok: boolean }
const ToastContext = createContext<{ push: (text: string, ok: boolean) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, ok: boolean) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text, ok }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5000);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-lg border px-4 py-2.5 text-sm shadow-xl ${
              toast.ok
                ? "border-emerald-500/50 bg-emerald-950 text-emerald-200"
                : "border-red-500/50 bg-red-950 text-red-200"
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context.push;
}

export function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 403
      ? `Sin permiso para esta operación (${error.code})`
      : error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

// ── Mutation helper: toast + cache invalidation in one call ─────────────────

export function useAction<TArgs = void>(
  action: (args: TArgs) => Promise<unknown>,
  options: { ok?: string; invalidate?: readonly string[] } = {},
) {
  const toast = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      if (options.ok) toast(options.ok, true);
      for (const key of options.invalidate ?? []) queryClient.invalidateQueries({ queryKey: [key] });
    },
    onError: (error) => toast(errorText(error), false),
  });
}

/** GET wrapper with loading/error states for simple data panels. */
export function useData<T>(
  key: readonly unknown[],
  path: string,
  refetchInterval?: number,
  enabled = true,
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => api<T>(path),
    refetchInterval,
    enabled,
  });
}

// ── Layout primitives ────────────────────────────────────────────────────────

export function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-xl border border-ink-line bg-ink-800 p-4">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mut">{title}</h2>
        <div className="flex-1" />
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-ink-mut">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-ink-line bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-500";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputClass} />;
}

export function Button({
  kind = "primary", busy, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "ghost" | "danger" | "glass"; busy?: boolean }) {
  const styles = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white border-transparent",
    ghost: "border-ink-line text-ink-txt hover:bg-ink-700",
    danger: "border-red-500/60 text-red-300 hover:bg-red-950",
    // Liquid-glass pill used on the public site (video/photo backgrounds).
    glass: "liquid-glass !rounded-full px-5 py-2 text-white hover:bg-white/10",
  }[kind];
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40 ${styles} ${props.className ?? ""}`}
    />
  );
}

/** Glass surface panel for overlays over imagery (public site sections). */
export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`liquid-glass !overflow-visible rounded-2xl ${className}`}>
      <div className="relative">{children}</div>
    </div>
  );
}

const PILL: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-300",
  occupied: "bg-amber-500/15 text-amber-300",
  reserved: "bg-sky-500/15 text-sky-300",
  waiting_cleaning: "bg-violet-500/15 text-violet-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  delivered: "bg-emerald-500/15 text-emerald-300",
  ok: "bg-emerald-500/15 text-emerald-300",
  voided: "bg-red-500/15 text-red-300",
  cancelled: "bg-red-500/15 text-red-300",
  denied: "bg-red-500/15 text-red-300",
  critical: "bg-red-500/15 text-red-300",
  warning: "bg-amber-500/15 text-amber-300",
  info: "bg-sky-500/15 text-sky-300",
  pending: "bg-amber-500/15 text-amber-300",
  open: "bg-amber-500/15 text-amber-300",
  submitted: "bg-amber-500/15 text-amber-300",
  settled: "bg-emerald-500/15 text-emerald-300",
};

export function Pill({ value }: { value: string }) {
  const style = PILL[value] ?? "bg-ink-700 text-ink-txt";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${style}`}>{value}</span>;
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  if (rows.length === 0) {
    return <p className="py-4 text-center text-sm text-ink-mut">Sin registros.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-line text-left text-xs uppercase tracking-wide text-ink-mut">
            {head.map((cell) => <th key={cell} className="px-2 py-2">{cell}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-ink-line/60 hover:bg-ink-700/40">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-2 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-ink-line bg-ink-800 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-ink-mut hover:text-ink-txt">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Reusable reason modal for operations that require an auditable motive. */
export function ReasonModal({ open, title, label, onClose, onSubmit }: {
  open: boolean; title: string; label: string; onClose: () => void; onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <Field label={label}>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </Field>
      <div className="mt-4 flex justify-end gap-2">
        <Button kind="ghost" onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!reason.trim()}
          onClick={() => { onSubmit(reason.trim()); onClose(); }}
        >
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}

export function Loading({ error, empty }: { error?: unknown; empty?: boolean }) {
  if (error) return <p className="py-4 text-sm text-red-300">{errorText(error)}</p>;
  if (empty) return null;
  return <p className="py-4 text-sm text-ink-mut">Cargando…</p>;
}

export const money = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("es", { minimumFractionDigits: 2 }) : "—";
};

export const dateTime = (value: unknown) => {
  if (typeof value !== "string") return "—";
  return new Date(value).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
};
