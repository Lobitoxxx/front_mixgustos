//! Finanzas: expense categories, expenses, payables and settlement.

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, money, Pill, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Category { id: string; name: string }
interface Expense {
  id: string; category_id: string; amount: number; spent_at: string; description: string;
}
interface Payable { id: string; supplier_invoice_id: string; status: string; amount_due: number; due_date?: string | null }

export default function Finanzas() {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const categories = useData<Category[]>(["finance", "categories"], "/finance/expense-categories");
  const expenses = useData<Expense[]>(["finance", "expenses"], "/finance/expenses", 12000);
  const payables = useData<Payable[]>(["finance", "payables"], "/finance/payables", 12000);

  const recordExpense = useAction(
    () => api("/finance/expenses", {
      method: "POST",
      body: { category_id: categoryId, amount: Number(amount), spent_at: spentAt, description },
    }),
    { ok: "Gasto registrado", invalidate: ["finance"] },
  );
  const settle = useAction(
    (id: string) => api(`/finance/payables/${id}/settle`, { method: "POST" }),
    { ok: "Liquidada", invalidate: ["finance"] },
  );

  const categoryName = (id: string) => (categories.data ?? []).find((c) => c.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="space-y-4">
      <Card
        title="Gastos operativos"
        actions={<Button onClick={() => setExpenseOpen(true)}>Registrar gasto</Button>}
      >
        {expenses.isLoading ? <Loading /> : (
          <Table
            head={["Fecha", "Categoría", "Descripción", "Monto"]}
            rows={(expenses.data ?? []).map((expense) => [
              expense.spent_at,
              categoryName(expense.category_id),
              expense.description,
              money(expense.amount),
            ])}
          />
        )}
      </Card>

      <Card title="Cuentas por pagar">
        {payables.isLoading ? <Loading /> : (
          <Table
            head={["Factura", "Monto", "Vence", "Estado", ""]}
            rows={(payables.data ?? []).map((payable) => [
              payable.supplier_invoice_id.slice(0, 8),
              money(payable.amount_due),
              payable.due_date ?? "—",
              <Pill key="s" value={payable.status} />,
              payable.status === "open" && (
                <Button key="b" kind="ghost" busy={settle.isPending} onClick={() => settle.mutate(payable.id)}>
                  Liquidar
                </Button>
              ),
            ])}
          />
        )}
      </Card>

      <Modal open={expenseOpen} title="Registrar gasto" onClose={() => setExpenseOpen(false)}>
        <div className="space-y-3">
          <Field label="Categoría">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Selecciona…</option>
              {(categories.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Monto"><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Fecha del gasto"><Input type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} /></Field>
          <Field label="Descripción"><Input value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setExpenseOpen(false)}>Cancelar</Button>
          <Button busy={recordExpense.isPending} disabled={!categoryId || !amount || !description.trim()}
            onClick={() => recordExpense.mutate(undefined, { onSuccess: () => setExpenseOpen(false) })}>
            Registrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
