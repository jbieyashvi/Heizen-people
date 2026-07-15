import type { TrendPoint } from "@/lib/admin/analytics";
import { InlineEmpty } from "@/components/agent/AgentStates";

const H = 200;
const PAD_BOTTOM = 28;
const PAD_TOP = 12;
const GROUP_W = 46;
const BAR_W = 14;

export function VolumeTrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.created, p.resolved)));
  const hasData = points.some((p) => p.created > 0 || p.resolved > 0);
  const chartH = H - PAD_BOTTOM - PAD_TOP;
  const width = Math.max(points.length * GROUP_W, 320);

  const y = (v: number) => PAD_TOP + chartH - (v / max) * chartH;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-heizen-500" aria-hidden /> Created</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" aria-hidden /> Resolved</span>
      </div>

      {!hasData ? (
        <InlineEmpty title="No ticket activity in this range" note="Try a wider date range or different filters." />
      ) : (
        <div className="overflow-x-auto">
          <svg width={width} height={H} role="img" aria-label="Tickets created and resolved over time" className="block">
            {/* Baseline */}
            <line x1={0} y1={PAD_TOP + chartH} x2={width} y2={PAD_TOP + chartH} stroke="#EAECEE" />
            {/* Gridline at max */}
            <line x1={0} y1={PAD_TOP} x2={width} y2={PAD_TOP} stroke="#F1F3F4" />
            <text x={2} y={PAD_TOP + 4} className="fill-slate-300 text-[9px]">{max}</text>

            {points.map((p, i) => {
              const cx = i * GROUP_W + GROUP_W / 2;
              const createdH = PAD_TOP + chartH - y(p.created);
              const resolvedH = PAD_TOP + chartH - y(p.resolved);
              return (
                <g key={p.label}>
                  <rect x={cx - BAR_W - 1} y={y(p.created)} width={BAR_W} height={Math.max(0, createdH)} rx={2} className="fill-heizen-500">
                    <title>{`${p.label}: ${p.created} created`}</title>
                  </rect>
                  <rect x={cx + 1} y={y(p.resolved)} width={BAR_W} height={Math.max(0, resolvedH)} rx={2} className="fill-emerald-400">
                    <title>{`${p.label}: ${p.resolved} resolved`}</title>
                  </rect>
                  <text x={cx} y={H - 10} textAnchor="middle" className="fill-slate-400 text-[9px]">{p.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
