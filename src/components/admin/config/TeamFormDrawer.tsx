"use client";

import { useEffect, useState } from "react";
import type { Department, SupportTeam } from "@/lib/admin/orgTypes";
import { Drawer } from "@/components/ui/Drawer";
import { Field, inputClass } from "@/components/admin/config/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  mode: "add" | "edit";
  team?: SupportTeam;
  departments: Department[];
  teams: SupportTeam[];
  presetDepartmentId?: string;
  onClose: () => void;
  onSubmit: (values: Omit<SupportTeam, "id">) => void;
}

interface FormValues {
  name: string;
  code: string;
  departmentId: string;
  lead: string;
  description: string;
  supportEmail: string;
  status: SupportTeam["status"];
}

const EMPTY: FormValues = { name: "", code: "", departmentId: "", lead: "", description: "", supportEmail: "", status: "Active" };

export function TeamFormDrawer({ open, mode, team, departments, teams, presetDepartmentId, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && team) {
      setValues({ name: team.name, code: team.code, departmentId: team.departmentId, lead: team.lead, description: team.description, supportEmail: team.supportEmail, status: team.status });
    } else {
      setValues({ ...EMPTY, departmentId: presetDepartmentId ?? departments[0]?.id ?? "" });
    }
    setErrors({});
  }, [open, mode, team, presetDepartmentId, departments]);

  if (!open) return null;
  const set = (patch: Partial<FormValues>) => setValues((v) => ({ ...v, ...patch }));

  function validate(): boolean {
    const e: Partial<Record<keyof FormValues, string>> = {};
    const others = teams.filter((t) => t.id !== team?.id);
    if (!values.name.trim()) e.name = "Team name is required.";
    else if (others.some((t) => t.name.trim().toLowerCase() === values.name.trim().toLowerCase())) e.name = "A team with this name already exists.";
    if (!values.code.trim()) e.code = "Team code is required.";
    else if (others.some((t) => t.code.toUpperCase() === values.code.trim().toUpperCase())) e.code = "This code is already in use.";
    if (!values.departmentId) e.departmentId = "Department is required.";
    if (!values.lead.trim()) e.lead = "Team lead is required.";
    if (values.supportEmail.trim() && !EMAIL_RE.test(values.supportEmail.trim())) e.supportEmail = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    onSubmit({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      departmentId: values.departmentId,
      // New teams route by their own name; edits keep the existing ticket team.
      ticketTeam: team?.ticketTeam ?? values.name.trim(),
      lead: values.lead.trim(),
      description: values.description.trim(),
      supportEmail: values.supportEmail.trim(),
      status: values.status,
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add Support Team" : "Edit Support Team"}
      description={mode === "add" ? "Create a team inside a department." : team?.name}
      footer={
        <>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
          <button type="button" onClick={submit} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">{mode === "add" ? "Create Team" : "Save Changes"}</button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Field label="Team Name" htmlFor="t-name" required error={errors.name}>
          <input id="t-name" value={values.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Team Code" htmlFor="t-code" required error={errors.code} hint="Uppercase, unique.">
          <input id="t-code" value={values.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} className={inputClass} />
        </Field>
        <Field label="Department" htmlFor="t-dept" required error={errors.departmentId}>
          <select id="t-dept" value={values.departmentId} onChange={(e) => set({ departmentId: e.target.value })} className={inputClass}>
            <option value="">Select a department…</option>
            {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
        </Field>
        <Field label="Team Lead" htmlFor="t-lead" required error={errors.lead}>
          <input id="t-lead" value={values.lead} onChange={(e) => set({ lead: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Description" htmlFor="t-desc">
          <textarea id="t-desc" rows={2} value={values.description} onChange={(e) => set({ description: e.target.value })} className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" />
        </Field>
        <Field label="Support Email" htmlFor="t-email" error={errors.supportEmail}>
          <input id="t-email" type="email" value={values.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Status" htmlFor="t-status">
          <select id="t-status" value={values.status} onChange={(e) => set({ status: e.target.value as SupportTeam["status"] })} className={inputClass}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>
      </div>
    </Drawer>
  );
}
