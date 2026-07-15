import Link from "next/link";
import { Activity } from "lucide-react";
import type { OperationalActivity } from "@/lib/admin/analytics";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";
import { InlineEmpty } from "@/components/agent/AgentStates";

export function OperationalActivityFeed({ items }: { items: OperationalActivity[] }) {
  if (items.length === 0) return <InlineEmpty icon={Activity} title="No recent activity" />;

  return (
    <ul className="flex flex-col divide-y divide-[#EAECEE]">
      {items.map((item) => (
        <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-700">
                <span className="font-medium">{item.event}</span>{" "}
                <span className="text-slate-400">· {item.team}</span>
              </p>
              <p className="text-xs text-slate-400">
                <Link href={`/admin/tickets/${item.ticketId}`} className="rounded font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400">
                  {item.ticketId}
                </Link>{" "}
                · {item.by}
              </p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-400">{formatDisplayDateTime(item.at)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
