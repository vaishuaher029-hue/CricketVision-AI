import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode, RefObject } from 'react';
import { ChartColumn, Table } from 'lucide-react';
import type { Point } from '../lib/stats';
import { cx } from '../lib/format';

/** Card shell shared by all charts: title, optional table view (accessibility), source badge slot. */
export function ChartCard({ title, subtitle, rows, valueLabel, badge, children, className }: { title: string; subtitle?: string; rows: Point[]; valueLabel: string; badge?: ReactNode; children: ReactNode; className?: string }) {
  const [table, setTable] = useState(false);
  return (
    <section className={cx('rounded-2xl border border-navy-600 bg-navy-800 p-5 sm:p-6', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-mute">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          <button type="button" onClick={() => setTable((t) => !t)} aria-pressed={table} aria-label={table ? 'Show chart' : 'Show data table'} className="grid size-8 cursor-pointer place-items-center rounded-lg border border-navy-600 text-mute transition hover:text-white">
            {table ? <ChartColumn className="size-4" aria-hidden /> : <Table className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
      {table ? (
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="text-mute-2"><th className="border-b border-navy-500 py-2 font-semibold">Item</th><th className="border-b border-navy-500 py-2 text-right font-semibold">{valueLabel}</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.label}><td className="border-b border-navy-600 py-2 text-ink-soft">{r.label}</td><td className="border-b border-navy-600 py-2 text-right tabular-nums text-ink-soft">{r.value}</td></tr>)}</tbody>
          </table>
        </div>
      ) : children}
    </section>
  );
}

function useWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Single-series area/line chart with a crosshair tooltip. */
export function ActivityChart({ data, unit = 'images' }: { data: Point[]; unit?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const h = 220;
  const pad = { l: 30, r: 10, t: 12, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.value));
  const niceMax = Math.ceil(max / 4) * 4;
  const w = Math.max(width, 240);
  const x = (i: number) => pad.l + (data.length <= 1 ? 0 : (i * (w - pad.l - pad.r)) / (data.length - 1));
  const y = (v: number) => pad.t + (1 - v / niceMax) * (h - pad.t - pad.b);
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const ticks = [0, 1, 2, 3, 4].map((t) => (niceMax / 4) * t);

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - pad.l) / (w - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  }
  const hp = hover === null ? null : data[hover];
  return (
    <div ref={ref} className="relative">
      <svg width={w} height={h} role="img" aria-label="Line chart of identification activity per day" onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="touch-pan-y">
        <defs>
          <linearGradient id="act-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3987e5" stopOpacity="0.35" />
            <stop offset="1" stopColor="#3987e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} className="stroke-navy-600" strokeWidth="1" />
            <text x={pad.l - 8} y={y(t) + 3} textAnchor="end" className="fill-mute-2 text-[10px]">{t}</text>
          </g>
        ))}
        <path d={area} fill="url(#act-fill)" />
        <path d={line} fill="none" className="stroke-series-1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) => (
          <text key={i} x={x(i)} y={h - 6} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} className="fill-mute-2 text-[10px]">{data[i]?.label}</text>
        ))}
        {hover !== null && hp && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} className="stroke-mute-2" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(hp.value)} r="5" className="fill-series-1 stroke-navy-800" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && hp && (
        <div className="pointer-events-none absolute top-1 rounded-lg border border-navy-500 bg-navy-900 px-3 py-2 text-xs shadow-xl" style={{ left: Math.min(Math.max(x(hover) - 50, 0), w - 120) }}>
          <div className="text-mute">{hp.label}</div>
          <b className="tabular-nums">{hp.value}</b> <span className="text-mute-2">{unit}</span>
        </div>
      )}
    </div>
  );
}

/** Horizontal bars: one series, thin marks, rounded data-ends, value label at the end of each bar. */
export function BarList({ data, colorClass = 'bg-series-1', empty }: { data: Point[]; colorClass?: string; empty: string }) {
  if (data.length === 0) return <p className="py-10 text-center text-xs text-mute-2">{empty}</p>;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${d.value}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-ink-soft">{d.label}</span>
            <b className="tabular-nums text-ink">{d.value}</b>
          </div>
          <div className="h-2 rounded-full bg-navy-700">
            <div className={cx('h-2 rounded-full transition-all duration-500 group-hover:brightness-125', colorClass)} style={{ width: `${Math.max(3, (d.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Two-segment donut with a 2px surface gap and a legend that carries labels and values (not colour alone). */
export function Donut({ a, b, labelA, labelB, empty }: { a: number; b: number; labelA: string; labelB: string; empty: string }) {
  const total = a + b;
  if (total === 0) return <p className="py-10 text-center text-xs text-mute-2">{empty}</p>;
  const r = 52;
  const c = 2 * Math.PI * r;
  const gap = a > 0 && b > 0 ? 3 : 0;
  const segA = Math.max(0, (a / total) * c - gap);
  const segB = Math.max(0, (b / total) * c - gap);
  const pct = Math.round((a / total) * 100);
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-36 -rotate-90" role="img" aria-label={`${labelA}: ${a}, ${labelB}: ${b}`}>
        <circle cx="70" cy="70" r={r} fill="none" className="stroke-navy-700" strokeWidth="16" />
        {a > 0 && <circle cx="70" cy="70" r={r} fill="none" className="stroke-series-1" strokeWidth="16" strokeDasharray={`${segA} ${c - segA}`} strokeDashoffset="0" />}
        {b > 0 && <circle cx="70" cy="70" r={r} fill="none" className="stroke-series-2" strokeWidth="16" strokeDasharray={`${segB} ${c - segB}`} strokeDashoffset={-(segA + gap)} />}
        <text x="70" y="70" transform="rotate(90 70 70)" textAnchor="middle" dominantBaseline="central" className="fill-ink text-[26px] font-extrabold">{pct}%</text>
      </svg>
      <ul className="space-y-3 text-xs">
        <li className="flex items-center gap-2.5"><span className="size-3 rounded-sm bg-series-1" aria-hidden /><span className="text-ink-soft">{labelA}</span><b className="ml-1 tabular-nums">{a}</b></li>
        <li className="flex items-center gap-2.5"><span className="size-3 rounded-sm bg-series-2" aria-hidden /><span className="text-ink-soft">{labelB}</span><b className="ml-1 tabular-nums">{b}</b></li>
      </ul>
    </div>
  );
}
