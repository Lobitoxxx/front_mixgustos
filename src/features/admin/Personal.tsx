//! Personal: employees with employment lifecycle (status changes, promote),
//! payments and documents (files stay outside the DB — only references).

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, Pill, ReasonModal, Select,
  Table, useAction, useData,
} from "../../ui/kit";

interface Employee {
  id: string; full_name: string; dni: string; status: string; hire_date: string;
}
interface Concept { id: string; code: string; name: string }

export default function Personal() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailFor, setDetailFor] = useState<Employee | null>(null);
  const [statusFor, setStatusFor] = useState<Employee | null>(null);
  const [promoteFor, setPromoteFor] = useState<Employee | null>(null);

  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [hireDate, setHireDate] = useState(new Date().toISOString().slice(0, 10));
  const [conceptId, setConceptId] = useState("");
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [docType, setDocType] = useState("contract");
  const [docRef, setDocRef] = useState("");

  const employees = useData<Employee[]>(["staff", "employees"], "/staff/employees", 15000);
  const concepts = useData<Concept[]>(["staff", "concepts"], "/staff/payment-concepts");
  const payments = useData<unknown[]>(
    ["staff", "payments", detailFor?.id ?? "none"],
    detailFor ? `/staff/employees/${detailFor.id}/payments` : "",
    undefined,
    !!detailFor,
  );
  const documents = useData<unknown[]>(
    ["staff", "documents", detailFor?.id ?? "none"],
    detailFor ? `/staff/employees/${detailFor.id}/documents` : "",
    undefined,
    !!detailFor,
  );

  const create = useAction(
    () => api("/staff/employees", {
      method: "POST",
      body: { user_id: null, full_name: fullName, dni, hire_date: hireDate },
    }),
    { ok: "Empleado creado", invalidate: ["staff"] },
  );
  const changeStatus = useAction(
    (args: { id: string; status: string; description: string }) =>
      api(`/staff/employees/${args.id}/status`, {
        method: "POST",
        body: { status: args.status, description: args.description, effective_on: new Date().toISOString().slice(0, 10) },
      }),
    { ok: "Estado actualizado", invalidate: ["staff"] },
  );
  const promote = useAction(
    (args: { id: string; description: string }) =>
      api(`/staff/employees/${args.id}/promote`, {
        method: "POST",
        body: { description: args.description, effective_on: new Date().toISOString().slice(0, 10) },
      }),
    { ok: "Promoción registrada", invalidate: ["staff"] },
  );
  const recordPayment = useAction(
    () => api(`/staff/employees/${detailFor?.id}/payments`, {
      method: "POST",
      body: { concept_id: conceptId, amount: Number(amount), paid_on: paidOn, notes: null },
    }),
    { ok: "Pago registrado", invalidate: ["staff"] },
  );
  const attachDocument = useAction(
    () => api(`/staff/employees/${detailFor?.id}/documents`, {
      method: "POST",
      body: { doc_type: docType, file_ref: docRef },
    }),
    { ok: "Documento adjuntado", invalidate: ["staff"] },
  );

  return (
    <div className="space-y-4">
      <Card
        title={`Empleados (${employees.data?.length ?? 0})`}
        actions={<Button onClick={() => setCreateOpen(true)}>Nuevo empleado</Button>}
      >
        {employees.isLoading ? <Loading /> : (
          <Table
            head={["Nombre", "DNI", "Contratación", "Estado", "Acciones"]}
            rows={(employees.data ?? []).map((employee) => [
              employee.full_name,
              employee.dni,
              employee.hire_date,
              <Pill key="s" value={employee.status} />,
              <div key="a" className="flex flex-wrap gap-1.5">
                <Button kind="ghost" onClick={() => setDetailFor(employee)}>Ficha</Button>
                {employee.status === "active" && (
                  <>
                    <Button kind="ghost" onClick={() => setPromoteFor(employee)}>Promover</Button>
                    <Button kind="ghost" onClick={() => setStatusFor(employee)}>Suspender/Terminar</Button>
                  </>
                )}
                {employee.status === "suspended" && (
                  <Button kind="ghost" onClick={() => setStatusFor(employee)}>Reactivar</Button>
                )}
              </div>,
            ])}
          />
        )}
      </Card>

      <Modal open={createOpen} title="Nuevo empleado" onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre completo"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
          <Field label="DNI"><Input value={dni} onChange={(e) => setDni(e.target.value)} /></Field>
          <Field label="Fecha de contratación"><Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button busy={create.isPending} disabled={!fullName.trim() || !dni.trim()}
            onClick={() => create.mutate(undefined, { onSuccess: () => setCreateOpen(false) })}>
            Crear
          </Button>
        </div>
      </Modal>

      <Modal open={detailFor !== null} title={`Ficha · ${detailFor?.full_name ?? ""}`} onClose={() => setDetailFor(null)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Concepto de pago">
              <Select value={conceptId} onChange={(e) => setConceptId(e.target.value)}>
                <option value="">Selecciona…</option>
                {(concepts.data ?? []).map((concept) => (
                  <option key={concept.id} value={concept.id}>{concept.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Monto"><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Pagado el"><Input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} /></Field>
            <div className="flex items-end">
              <Button busy={recordPayment.isPending} disabled={!conceptId || !amount}
                onClick={() => recordPayment.mutate(undefined)}>Registrar pago</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo de documento">
              <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="contract">Contrato</option>
                <option value="id_card">Identificación</option>
                <option value="certificate">Certificado</option>
                <option value="other">Otro</option>
              </Select>
            </Field>
            <Field label="Referencia del archivo"><Input value={docRef} onChange={(e) => setDocRef(e.target.value)} placeholder="ruta o URI del repositorio" /></Field>
            <div className="flex items-end">
              <Button kind="ghost" busy={attachDocument.isPending} disabled={!docRef.trim()}
                onClick={() => attachDocument.mutate(undefined)}>Adjuntar documento</Button>
            </div>
          </div>

          {payments.data && (payments.data as unknown[]).length > 0 && (
            <p className="text-xs text-ink-mut">{payments.data.length} pago(s) registrados.</p>
          )}
          {documents.data && (documents.data as unknown[]).length > 0 && (
            <p className="text-xs text-ink-mut">{documents.data.length} documento(s) adjuntos.</p>
          )}
        </div>
      </Modal>

      <ReasonModal
        open={statusFor !== null}
        title="Cambiar estado del empleado"
        label="Descripción del cambio (auditable)"
        onClose={() => setStatusFor(null)}
        onSubmit={(description) => {
          if (!statusFor) return;
          const status = statusFor.status === "active" ? "suspended" : "active";
          changeStatus.mutate({ id: statusFor.id, status, description });
        }}
      />

      <ReasonModal
        open={promoteFor !== null}
        title="Promover empleado"
        label="Descripción de la promoción (auditable)"
        onClose={() => setPromoteFor(null)}
        onSubmit={(description) => promoteFor && promote.mutate({ id: promoteFor.id, description })}
      />
    </div>
  );
}
