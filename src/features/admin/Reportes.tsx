//! Reportes: financial close (§8.6) with real/calculated/estimated badges,
//! daily series tables and a sales bar chart.

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, Field, Input, Loading, money, Table, useData } from "../../ui/kit";

interface Figure { value: number | string; basis: string }
interface Close {
  from: string; to: string; sales_count: number;
  sales: Figure; discounts: Figure; expenses: Figure; consumed_cost: Figure;
  open_payables: Figure; gross_result: Figure; operating_result: Figure; net_estimated: Figure;
  payments_by_method: [string, number][];
}
interface SalesRow { day: string; sales_count: number; discounts: number; total: number }
interface PaymentRow { day: string; method: string; amount: number }
interface GenericRow { day: string; total?: number; amount?: number }

const monthStart = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const DEFAULT_FROM = iso(new Date(monthStart.getFullYear(), monthStart.getMonth(), 1));
const DEFAULT_TO = iso(new Date());

function Badge({ basis }: { basis: string }) {
  const color = basis === "real"
    ? "bg-emerald-500/15 text-emerald-300"
    : basis === "calculated"
      ? "bg-sky-500/15 text-sky-300"
      : "bg-amber-500/15 text-amber-300";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${color}`}>{basis}</span>;
}

export default function Reportes() {
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const range = `from=${from}&to=${to}`;

  const close = useData<Close>(["reports", "close", from, to], `/reports/financial-close?${range}`);
  const sales = useData<SalesRow[]>(["reports", "sales", from, to], `/reports/sales?${range}`);
  const payments = useData<PaymentRow[]>(["reports", "payments", from, to], `/reports/payments?${range}`);
  const expenses = useData<GenericRow[]>(["reports", "expenses", from, to], `/reports/expenses?${range}`);
  const consumed = useData<GenericRow[]>(["reports", "consumed", from, to], `/reports/consumed-cost?${range}`);

  const chartData = (sales.data ?? []).map((row) => ({
    day: row.day.slice(5),
    ventas: Number(row.total),
  }));

  const figure = (f: Figure) => (
    <span className="inline-flex items-center gap-2">
      <b>{money(f.value)}</b> <Badge basis={f.basis} />
    </span>
  );

  return (
    <div className="space-y-4">
      <Card title="Período">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40"><Field label="Desde"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field></div>
          <div className="w-40"><Field label="Hasta"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field></div>
          <p className="mb-1 text-xs text-ink-mut">Las series diarias se agrupan por día UTC.</p>
        </div>
      </Card>

      <Card title="Cierre financiero (§8.6)">
        {close.isLoading ? <Loading /> : close.error ? <p className="text-sm text-red-300">Necesitas el permiso reports.financial.view</p> : (
          <div className="space-y-3">
            <Table
              head={["Concepto", "Valor"]}
              rows={close.data ? [
                ["Ventas completadas (" + close.data.sales_count + ")", figure(close.data.sales)],
                ["Descuentos", figure(close.data.discounts)],
                ["Gastos operativos", figure(close.data.expenses)],
                ["Costo de productos consumidos", figure(close.data.consumed_cost)],
                ["Cuentas por pagar abiertas", figure(close.data.open_payables)],
                ["Resultado bruto", figure(close.data.gross_result)],
                ["Resultado operativo", figure(close.data.operating_result)],
                ["Neto estimado", figure(close.data.net_estimated)],
              ] : []}
            />
            <p className="text-xs text-ink-mut">
              Cobros por medio: {
                (close.data?.payments_by_method ?? []).map(([method, amount]) => `${method}: ${money(amount)}`).join(" · ") || "—"
              }
            </p>
          </div>
        )}
      </Card>

      <Card title="Ventas por día">
        {chartData.length > 0 && (
          <div className="mb-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253049" />
                <XAxis dataKey="day" tick={{ fill: "#8fa0c0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8fa0c0", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#171e2e", border: "1px solid #253049", borderRadius: 8 }}
                  labelStyle={{ color: "#e8ecf6" }}
                />
                <Bar dataKey="ventas" fill="#f0603a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {sales.isLoading ? <Loading /> : (
          <Table
            head={["Día", "Ventas", "Descuentos", "Total"]}
            rows={(sales.data ?? []).map((row) => [row.day, row.sales_count, money(row.discounts), money(row.total)])}
          />
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Cobros por día y medio">
          {payments.isLoading ? <Loading /> : (
            <Table
              head={["Día", "Medio", "Monto"]}
              rows={(payments.data ?? []).map((row) => [row.day, row.method, money(row.amount)])}
            />
          )}
        </Card>
        <Card title="Gastos por día">
          {expenses.isLoading ? <Loading /> : (
            <Table
              head={["Día", "Total"]}
              rows={(expenses.data ?? []).map((row) => [row.day, money(row.total ?? row.amount ?? 0)])}
            />
          )}
        </Card>
        <Card title="Costo consumido por día">
          {consumed.isLoading ? <Loading /> : (
            <Table
              head={["Día", "Total"]}
              rows={(consumed.data ?? []).map((row) => [row.day, money(row.total ?? row.amount ?? 0)])}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
