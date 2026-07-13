interface SectionHeadingProps {
  title: string;
  action?: React.ReactNode;
}

/** Consistent heading row for dashboard sections. */
export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {action}
    </div>
  );
}
