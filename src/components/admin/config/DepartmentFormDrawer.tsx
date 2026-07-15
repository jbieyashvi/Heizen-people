"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { Department } from "@/lib/admin/orgTypes";
import { Drawer } from "@/components/ui/Drawer";
import { Field, inputClass } from "@/components/admin/config/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DepartmentFormDrawerProps {
  open: boolean;
  mode: "add" | "edit";
  department?: Department;
  departments: Department[];
  /** True when the department already has teams/tickets — code is locked. */
  codeLocked: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Department, "id">) => void;
}

interface FormValues {
  name: string;
  code: string;
  description: string;
  lead: string;
  supportEmail: string;
  status: Department["status"];
}

const EMPTY: FormValues = { name: "", code: "", description: "", lead: "", supportEmail: "", status: "Active" };

export function DepartmentFormDrawer({ open, mode, department, departments, codeLocked, onClose, onSubmit }: DepartmentFormDrawerProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && department) {
      setValues({ name: department.name, code: department.code, description: department.description, lead: department.lead, supportEmail: department.supportEmail, status: department.status });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, department]);

  if (!open) return null;

  const set = (patch: Partial<FormValues>) => setValues((v) => ({ ...v, ...patch }));

  function validate(): boolean {
    const e: Partial<Record<keyof FormValues, string>> = {};
    const others = departments.filter((d) => d.id !== department?.id);
    if (!values.name.trim()) e.name = "Name is required.";
    else if (others.some((d) => d.name.trim().toLowerCase() === values.name.trim().toLowerCase())) e.name = "A department with this name already exists.";
    if (!values.code.trim()) e.code = "Code is required.";
    else if (others.some((d) => d.code === values.code.trim().toUpperCase())) e.code = "This code is already in use.";
    if (!values.description.trim()) e.description = "Description is required.";
    if (!values.lead.trim()) e.lead = "Department lead is required.";
    if (!values.supportEmail.trim()) e.supportEmail = "Support email is required.";
    else if (!EMAIL_RE.test(values.supportEmail.trim())) e.supportEmail = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    onSubmit({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim(),
      lead: values.lead.trim(),
      supportEmail: values.supportEmail.trim(),
      status: values.status,
      categories: department?.categories ?? [],
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add Department" : "Edit Department"}
      description={mode === "add" ? "Create a support department." : department?.name}
      footer={
        <>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
          <button type="button" onClick={submit} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">{mode === "add" ? "Create Department" : "Save Changes"}</button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Field label="Department Name" htmlFor="d-name" required error={errors.name}>
          <input id="d-name" value={values.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Department Code" htmlFor="d-code" required error={errors.code} hint={codeLocked ? undefined : "Uppercase, unique."}>
          <input id="d-code" value={values.code} disabled={codeLocked} onChange={(e) => set({ code: e.target.value.toUpperCase() })} className={inputClass} />
          {codeLocked && (
            <p className="mt-1 flex items-start gap-1.5 text-[11px] text-amber-700">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              Code can&rsquo;t be changed after teams or tickets are linked.
            </p>
          )}
        </Field>
        <Field label="Description" htmlFor="d-desc" required error={errors.description}>
          <textarea id="d-desc" rows={3} value={values.description} onChange={(e) => set({ description: e.target.value })} className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" />
        </Field>
        <Field label="Department Lead" htmlFor="d-lead" required error={errors.lead}>
          <input id="d-lead" value={values.lead} onChange={(e) => set({ lead: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Support Email" htmlFor="d-email" required error={errors.supportEmail}>
          <input id="d-email" type="email" value={values.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Status" htmlFor="d-status">
          <select id="d-status" value={values.status} onChange={(e) => set({ status: e.target.value as Department["status"] })} className={inputClass}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>
      </div>
    </Drawer>
  );
}
