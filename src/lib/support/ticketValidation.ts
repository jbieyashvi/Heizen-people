import {
  DESCRIPTION_MIN_LENGTH,
  SUBJECT_MAX_LENGTH,
} from "@/lib/config/ticketForm";
import type { TicketDraft } from "@/lib/types";

/** Required fields, in the order they appear — drives first-invalid focus. */
export const REQUIRED_FIELD_ORDER = [
  "category",
  "requestType",
  "subject",
  "description",
] as const;

export type TicketFieldKey = (typeof REQUIRED_FIELD_ORDER)[number];

export type TicketErrors = Partial<Record<TicketFieldKey, string>>;

/** Pure validation — no React, no DOM. Returns a message per invalid field. */
export function validateDraft(draft: TicketDraft): TicketErrors {
  const errors: TicketErrors = {};

  if (!draft.category) {
    errors.category = "Please select a request category.";
  }

  if (!draft.requestType) {
    errors.requestType = "Please select a request type.";
  }

  const subject = draft.subject.trim();
  if (subject.length === 0) {
    errors.subject = "Please enter a subject.";
  } else if (draft.subject.length > SUBJECT_MAX_LENGTH) {
    errors.subject = `Subject must be ${SUBJECT_MAX_LENGTH} characters or fewer.`;
  }

  const description = draft.descriptionText.trim();
  if (description.length === 0) {
    errors.description = "Please describe your request.";
  } else if (description.length < DESCRIPTION_MIN_LENGTH) {
    errors.description = `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`;
  }

  return errors;
}

export function isDraftValid(draft: TicketDraft): boolean {
  return Object.keys(validateDraft(draft)).length === 0;
}
