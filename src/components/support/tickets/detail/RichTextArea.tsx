"use client";

import { useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface RichTextAreaProps {
  onChange: (html: string, text: string) => void;
  ariaLabel: string;
  placeholder: string;
  minHeight?: string;
}

const TOOLBAR = [
  { key: "bold", label: "Bold", icon: Bold, command: "bold" },
  { key: "italic", label: "Italic", icon: Italic, command: "italic" },
  { key: "ul", label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { key: "ol", label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
] as const;

/**
 * Lightweight rich-text input (bold / italic / lists) used by the reply and
 * reopen composers. Uncontrolled — clear it by remounting with a new `key`.
 */
export function RichTextArea({ onChange, ariaLabel, placeholder, minHeight = "96px" }: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(true);

  function emit() {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText ?? "";
    setEmpty(text.trim().length === 0);
    onChange(el.innerHTML, text);
  }

  function runCommand(command: string) {
    editorRef.current?.focus();
    document.execCommand(command, false);
    emit();
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#EAECEE] bg-white transition-colors focus-within:border-heizen-300 focus-within:ring-2 focus-within:ring-heizen-100">
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
        {empty && (
          <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-slate-400">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          style={{ minHeight }}
          className="prose-editor w-full px-3 py-2.5 text-sm leading-relaxed text-slate-700 outline-none"
        />
      </div>
    </div>
  );
}
