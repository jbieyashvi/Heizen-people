"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/cn";
import { DESCRIPTION_MIN_LENGTH } from "@/lib/config/ticketForm";
import { FieldBlock } from "./FieldBlock";

interface DescriptionEditorProps {
  html: string;
  text: string;
  onChange: (html: string, text: string) => void;
  onBlur: () => void;
  error?: string;
  fieldId: string;
}

const TOOLBAR = [
  { key: "bold", label: "Bold", icon: Bold, command: "bold" },
  { key: "italic", label: "Italic", icon: Italic, command: "italic" },
  { key: "ul", label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { key: "ol", label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
] as const;

export function DescriptionEditor({ html, text, onChange, onBlur, error, fieldId }: DescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const count = text.trim().length;

  // Keep the DOM in sync when the value changes from outside (e.g. reset),
  // without disturbing the caret while the user is typing.
  useEffect(() => {
    const el = editorRef.current;
    if (el && document.activeElement !== el && el.innerHTML !== html) {
      el.innerHTML = html;
    }
  }, [html]);

  function emit() {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML, el.innerText ?? "");
  }

  function runCommand(command: string) {
    editorRef.current?.focus();
    // execCommand is deprecated but remains the lightest way to offer basic
    // rich-text formatting without pulling in an editor dependency.
    document.execCommand(command, false);
    emit();
  }

  return (
    <FieldBlock
      id={fieldId}
      label="Description"
      required
      error={error}
      hint={`Minimum ${DESCRIPTION_MIN_LENGTH} characters. Add as much detail as you can.`}
      meta={
        <span className={cn("text-xs tabular-nums", count < DESCRIPTION_MIN_LENGTH ? "text-slate-400" : "text-emerald-600")}>
          {count} {count === 1 ? "character" : "characters"}
        </span>
      }
    >
      <div
        className={cn(
          "overflow-hidden rounded-md border bg-white transition-colors focus-within:ring-2 focus-within:ring-heizen-100",
          error ? "border-red-300 focus-within:border-red-300" : "border-[#EAECEE] focus-within:border-heizen-300",
        )}
      >
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex items-center gap-0.5 border-b border-[#EAECEE] bg-surface-muted px-1.5 py-1"
        >
          {TOOLBAR.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.key}
                type="button"
                aria-label={tool.label}
                title={tool.label}
                // Prevent the button from stealing the selection before the command runs.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand(tool.command)}
                className="flex h-7 w-7 items-center justify-center rounded text-slate-500 outline-none hover:bg-white hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            );
          })}
        </div>

        <div className="relative">
          {count === 0 && (
            <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-slate-400">
              Describe your request in detail…
            </span>
          )}
          <div
            ref={editorRef}
            id={fieldId}
            role="textbox"
            aria-multiline="true"
            aria-label="Description"
            aria-invalid={error ? true : undefined}
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onBlur={onBlur}
            className="prose-editor min-h-[128px] w-full px-3 py-2.5 text-sm leading-relaxed text-slate-700 outline-none"
          />
        </div>
      </div>
    </FieldBlock>
  );
}
