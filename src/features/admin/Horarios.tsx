//! Horarios: schedules with shifts and employee assignments; schedule
//! changes record before/after with reason.

import { useState } from "react";
import { api } from "../../api/client";
import {
  Button, Card, Field, Input, Loading, Modal, Select, Table,
  useAction, useData,
} from "../../ui/kit";

interface Schedule { id: string; name: string; effective_from: string; active: boolean }
interface Shift { id: string; day_of_week: number; start_time: string; end_time: string }
interface Employee { id: string; full_name: string }

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Horarios() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");

  const [name, setName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("16:00");
  const [employee, setEmployee] = useState("");

  const schedules = useData<Schedule[]>(["schedules"], "/schedules", 15000);
  const employees = useData<Employee[]>(["staff", "employees"], "/staff/employees");
  const shifts = useData<Shift[]>(
    ["shifts", selected],
    selected ? `/schedules/${selected}/shifts` : "",
    undefined,
    !!selected,
  );

  const createSchedule = useAction(
    () => api("/schedules", { method: "POST", body: { name, effective_from: effectiveFrom } }),
    { ok: "Horario creado", invalidate: ["schedules"] },
  );
  const setActive = useAction(
    (args: { id: string; active: boolean }) =>
      api(`/schedules/${args.id}/active`, { method: "POST", body: { active: args.active } }),
    { ok: "Horario actualizado", invalidate: ["schedules"] },
  );
  const addShift = useAction(
    () => api(`/schedules/${selected}/shifts`, {
      method: "POST",
      body: { day_of_week: Number(day), start_time: start, end_time: end },
    }),
    { ok: "Turno agregado", invalidate: ["shifts"] },
  );
  const assign = useAction(
    (shiftId: string) => api(`/shifts/${shiftId}/assignments`, {
      method: "POST",
      body: { employee_id: employee },
    }),
    { ok: "Empleado asignado", invalidate: ["shifts"] },
  );

  return (
    <div className="space-y-4">
      <Card
        title={`Horarios (${schedules.data?.length ?? 0})`}
        actions={<Button onClick={() => setScheduleOpen(true)}>Nuevo horario</Button>}
      >
        {schedules.isLoading ? <Loading /> : (
          <Table
            head={["Nombre", "Vigente desde", "Activo", "Acciones"]}
            rows={(schedules.data ?? []).map((schedule) => [
              <button key="n" className="font-semibold underline-offset-2 hover:underline"
                onClick={() => setSelected(schedule.id)}>
                {schedule.name}
              </button>,
              schedule.effective_from,
              schedule.active ? "sí" : "no",
              <Button key="b" kind="ghost" onClick={() => setActive.mutate({ id: schedule.id, active: !schedule.active })}>
                {schedule.active ? "Desactivar" : "Activar"}
              </Button>,
            ])}
          />
        )}
      </Card>

      {selected && (
        <Card title={`Turnos · ${(schedules.data ?? []).find((s) => s.id === selected)?.name ?? ""}`}>
          {shifts.isLoading ? <Loading /> : (
            <Table
              head={["Día", "Inicio", "Fin", "Acciones"]}
              rows={(shifts.data ?? []).map((shift) => [
                DAYS[shift.day_of_week] ?? shift.day_of_week,
                shift.start_time,
                shift.end_time,
                <Button key="b" kind="ghost" busy={assign.isPending} disabled={!employee}
                  onClick={() => assign.mutate(shift.id)}>
                  Asignar seleccionado
                </Button>,
              ])}
            />
          )}
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-40">
              <Field label="Empleado a asignar">
                <Select value={employee} onChange={(e) => setEmployee(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {(employees.data ?? []).map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.full_name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-32">
              <Field label="Día">
                <Select value={day} onChange={(e) => setDay(e.target.value)}>
                  {DAYS.map((label, index) => <option key={index} value={index}>{label}</option>)}
                </Select>
              </Field>
            </div>
            <div className="w-28"><Field label="Inicio"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field></div>
            <div className="w-28"><Field label="Fin"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field></div>
            <Button busy={addShift.isPending} onClick={() => addShift.mutate(undefined)}>Agregar turno</Button>
          </div>
        </Card>
      )}

      <Modal open={scheduleOpen} title="Nuevo horario" onClose={() => setScheduleOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Vigente desde"><Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button kind="ghost" onClick={() => setScheduleOpen(false)}>Cancelar</Button>
          <Button busy={createSchedule.isPending} disabled={!name.trim()}
            onClick={() => createSchedule.mutate(undefined, { onSuccess: () => setScheduleOpen(false) })}>
            Crear
          </Button>
        </div>
      </Modal>
    </div>
  );
}
