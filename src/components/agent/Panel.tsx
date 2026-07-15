import { cn } from "@/lib/cn";

interface PanelProps {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** Compact bordered surface used across the agent dashboard. */
export function Panel({ title, action, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn("rounded-lg border border-[#EAECEE] bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-[#EAECEE] px-4 py-2.5">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {action}
        </div>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
