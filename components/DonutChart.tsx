"use client";

import type { Task } from "@/types/task";

interface DonutChartProps {
  tasks: Task[];
}

const SEGMENTS = [
  {
    key: "todo",
    label: "To Do",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.4)",
  },
  {
    key: "in-progress",
    label: "In Progress",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
  },
  {
    key: "done",
    label: "Done",
    color: "#10b981",
    glow: "rgba(16,185,129,0.4)",
  },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  thickness: number,
) {
  const outerStart = polarToCartesian(cx, cy, r, endDeg);
  const outerEnd = polarToCartesian(cx, cy, r, startDeg);
  const innerStart = polarToCartesian(cx, cy, r - thickness, endDeg);
  const innerEnd = polarToCartesian(cx, cy, r - thickness, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r - thickness} ${r - thickness} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({ tasks }: DonutChartProps) {
  const total = tasks.length;
  const counts: Record<string, number> = {
    todo: 0,
    "in-progress": 0,
    done: 0,
  };
  tasks.forEach((t) => {
    if (t.status in counts) counts[t.status]++;
    else counts["todo"]++;
  });

  const CX = 110;
  const CY = 110;
  const R = 90;
  const THICKNESS = 28;
  const GAP = 3; // degrees between segments

  let currentAngle = 0;

  const arcs = SEGMENTS.map((seg) => {
    const pct = total > 0 ? counts[seg.key] / total : 0;
    const sweep = pct * 360;
    const start = currentAngle;
    const end = currentAngle + Math.max(sweep - GAP, 0);
    currentAngle += sweep;
    return { ...seg, start, end, sweep, pct, count: counts[seg.key] };
  });

  const highPriority = tasks.filter(
    (t) => t.priority === "high" && t.status !== "done",
  ).length;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
      {/* SVG donut */}
      <div className="relative shrink-0">
        <svg width={220} height={220} viewBox="0 0 220 220">
          <defs>
            {SEGMENTS.map((seg) => (
              <filter key={seg.key} id={`glow-${seg.key}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Track ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R - THICKNESS / 2}
            fill="none"
            stroke="#1e293b"
            strokeWidth={THICKNESS}
          />

          {total === 0 ? (
            <circle
              cx={CX}
              cy={CY}
              r={R - THICKNESS / 2}
              fill="none"
              stroke="#334155"
              strokeWidth={THICKNESS}
              strokeDasharray="4 4"
            />
          ) : (
            arcs.map((arc) =>
              arc.sweep > 1 ? (
                <path
                  key={arc.key}
                  d={arcPath(CX, CY, R, arc.start, arc.end, THICKNESS)}
                  fill={arc.color}
                  opacity={0.9}
                  filter={`url(#glow-${arc.key})`}
                  className="transition-opacity hover:opacity-100"
                />
              ) : null,
            )
          )}

          {/* Centre label */}
          <text
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            fill="white"
            fontSize="28"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {total}
          </text>
          <text
            x={CX}
            y={CY + 12}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            total tasks
          </text>
        </svg>
      </div>

      {/* Legend + mini stats */}
      <div className="flex-1 w-full space-y-3">
        {arcs.map((arc) => (
          <div key={arc.key} className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: arc.color }}
            />
            <span className="flex-1 text-sm text-slate-300">{arc.label}</span>
            <span className="text-sm font-semibold text-white tabular-nums">
              {arc.count}
            </span>
            <span className="w-10 text-right text-xs text-slate-500 tabular-nums">
              {total > 0 ? Math.round(arc.pct * 100) : 0}%
            </span>
            {/* Mini progress bar */}
            <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${total > 0 ? arc.pct * 100 : 0}%`,
                  backgroundColor: arc.color,
                }}
              />
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-slate-800 pt-3 flex gap-4 flex-wrap">
          <div className="text-center">
            <p className="text-xs text-slate-500">High Priority</p>
            <p className="text-lg font-bold text-red-400">{highPriority}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Completion</p>
            <p className="text-lg font-bold text-emerald-400">
              {total > 0 ? Math.round((counts["done"] / total) * 100) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">In Progress</p>
            <p className="text-lg font-bold text-amber-400">
              {counts["in-progress"]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
