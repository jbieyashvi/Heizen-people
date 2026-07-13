"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  DEFAULT_PRIORITY,
  getAssignedTeam,
  getCategoryLabel,
} from "@/lib/config/ticketForm";
import { validateAttachment } from "@/lib/support/attachmentValidation";
import { REQUIRED_FIELD_ORDER, validateDraft } from "@/lib/support/ticketValidation";
import { addStoredTicket, generateTicketId } from "@/lib/store/ticketStore";
import type { AttachmentFile, StoredTicket, TicketCategoryKey, TicketDraft } from "@/lib/types";
import { CategoryPicker } from "./CategoryPicker";
import { RequestTypeSelect } from "./RequestTypeSelect";
import { SubjectField } from "./SubjectField";
import { DescriptionEditor } from "./DescriptionEditor";
import { AttachmentUpload } from "./AttachmentUpload";
import { PriorityPicker } from "./PriorityPicker";
import { RequestSummary } from "./RequestSummary";
import { SuccessState } from "./SuccessState";
import { ConfirmLeaveDialog } from "./ConfirmLeaveDialog";

type FieldKey = (typeof REQUIRED_FIELD_ORDER)[number];

function createDraft(category: TicketCategoryKey | null): TicketDraft {
  return {
    category,
    requestType: null,
    subject: "",
    descriptionHtml: "",
    descriptionText: "",
    priority: DEFAULT_PRIORITY,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `f-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function RaiseTicketFlow({ initialCategory }: { initialCategory: TicketCategoryKey | null }) {
  const router = useRouter();

  const [draft, setDraft] = useState<TicketDraft>(() => createDraft(initialCategory));
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState<StoredTicket | null>(null);
  const [pendingLeave, setPendingLeave] = useState<string | null>(null);

  const errors = useMemo(() => validateDraft(draft), [draft]);
  const canSubmit = Object.keys(errors).length === 0;

  const validAttachments = attachments.filter((f) => f.status === "success");

  const dirty =
    !submitted &&
    (draft.category !== null ||
      draft.requestType !== null ||
      draft.subject.trim().length > 0 ||
      draft.descriptionText.trim().length > 0 ||
      attachments.length > 0);

  // Warn on browser-level navigation (refresh / close) with unsaved input.
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const showError = (field: FieldKey) =>
    submitAttempted || touched[field] ? errors[field] : undefined;

  const markTouched = (field: FieldKey) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const setCategory = (category: TicketCategoryKey) => {
    // Reset request type when the category changes; keep all other input.
    setDraft((prev) => ({ ...prev, category, requestType: null }));
    markTouched("category");
  };

  const addFiles = (files: File[]) => {
    const mapped: AttachmentFile[] = files.map((file) => {
      const result = validateAttachment(file.name, file.size);
      return { id: newId(), name: file.name, size: file.size, ...result };
    });
    setAttachments((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id: string) =>
    setAttachments((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const currentErrors = validateDraft(draft);
    if (Object.keys(currentErrors).length > 0) {
      const firstInvalid = REQUIRED_FIELD_ORDER.find((f) => currentErrors[f]);
      if (firstInvalid) {
        document.getElementById(`field-${firstInvalid}`)?.focus();
      }
      return;
    }

    const now = new Date().toISOString();
    const ticket: StoredTicket = {
      id: generateTicketId(),
      subject: draft.subject.trim(),
      categoryKey: draft.category as TicketCategoryKey,
      categoryLabel: getCategoryLabel(draft.category) ?? "",
      requestType: draft.requestType as string,
      descriptionHtml: draft.descriptionHtml,
      priority: draft.priority,
      assignedTeam: getAssignedTeam(draft.category)!,
      status: "Open",
      attachmentCount: validAttachments.length,
      createdAt: now,
      updatedAt: now,
    };

    addStoredTicket(ticket);
    setSubmitted(ticket);
    window.scrollTo({ top: 0 });
  };

  const resetForm = useCallback(() => {
    setDraft(createDraft(null));
    setAttachments([]);
    setTouched({});
    setSubmitAttempted(false);
    setSubmitted(null);
  }, []);

  // Guarded navigation for in-app leave points (Cancel / Back / breadcrumb).
  const guardedNavigate = (href: string) => {
    if (dirty) {
      setPendingLeave(href);
    } else {
      router.push(href);
    }
  };

  const confirmLeave = () => {
    const href = pendingLeave;
    setPendingLeave(null);
    if (href) router.push(href);
  };

  if (submitted) {
    return <SuccessState ticket={submitted} onRaiseAnother={resetForm} />;
  }

  const assignedTeam = getAssignedTeam(draft.category);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Breadcrumb
          items={[
            { label: "Support Center", href: "/support" },
            { label: "Raise New Ticket" },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Raise New Ticket</h2>
            <p className="mt-0.5 max-w-xl text-sm text-slate-500">
              Tell us what you need help with and we&rsquo;ll route your request to the right team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => guardedNavigate("/support")}
            className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
            Back to Support Center
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2">
          <div className="flex flex-col gap-6 rounded-lg border border-[#EAECEE] bg-white p-5">
            <CategoryPicker
              fieldId="field-category"
              value={draft.category}
              onChange={setCategory}
              error={showError("category")}
            />
            <div className="border-t border-[#EAECEE]" />
            <RequestTypeSelect
              fieldId="field-requestType"
              category={draft.category}
              value={draft.requestType}
              onChange={(value) => {
                setDraft((prev) => ({ ...prev, requestType: value }));
                markTouched("requestType");
              }}
              error={showError("requestType")}
            />
            <SubjectField
              fieldId="field-subject"
              value={draft.subject}
              onChange={(value) => setDraft((prev) => ({ ...prev, subject: value }))}
              onBlur={() => markTouched("subject")}
              error={showError("subject")}
            />
            <DescriptionEditor
              fieldId="field-description"
              html={draft.descriptionHtml}
              text={draft.descriptionText}
              onChange={(html, text) =>
                setDraft((prev) => ({ ...prev, descriptionHtml: html, descriptionText: text }))
              }
              onBlur={() => markTouched("description")}
              error={showError("description")}
            />
            <div className="border-t border-[#EAECEE]" />
            <AttachmentUpload files={attachments} onAddFiles={addFiles} onRemove={removeFile} />
            <div className="border-t border-[#EAECEE]" />
            <PriorityPicker
              value={draft.priority}
              onChange={(priority) => setDraft((prev) => ({ ...prev, priority }))}
            />
          </div>

          {/* Action bar */}
          <div className="mt-4 flex items-center justify-end gap-2.5 rounded-lg border border-[#EAECEE] bg-white px-5 py-3.5">
            <button
              type="button"
              onClick={() => guardedNavigate("/support")}
              className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Submit Ticket
            </button>
          </div>
        </form>

        {/* Right: summary */}
        <aside className="lg:col-span-1">
          <RequestSummary
            categoryLabel={getCategoryLabel(draft.category)}
            requestType={draft.requestType}
            priority={draft.priority}
            attachmentCount={validAttachments.length}
            assignedTeam={assignedTeam}
          />
        </aside>
      </div>

      <ConfirmLeaveDialog
        open={pendingLeave !== null}
        onStay={() => setPendingLeave(null)}
        onLeave={confirmLeave}
      />
    </div>
  );
}
