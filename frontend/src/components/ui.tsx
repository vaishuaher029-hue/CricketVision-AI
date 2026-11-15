import { FlaskConical, LoaderCircle, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/format';
import { Link } from '../lib/router';

const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer';
const variants = {
  primary: 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/10 hover:-translate-y-0.5 hover:shadow-brand-500/30',
  secondary: 'border border-navy-600 bg-navy-700/60 text-ink-soft hover:border-brand-400/50 hover:text-white',
  ghost: 'text-mute hover:bg-navy-700/60 hover:text-white',
} as const;
export type Variant = keyof typeof variants;

export function Button({ variant = 'primary', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cx(base, variants[variant], className)} {...rest} />;
}

export function ButtonLink({ to, variant = 'primary', className, children }: { to: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link to={to} className={cx(base, variants[variant], className)}>{children}</Link>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx('rounded-2xl border border-navy-600 bg-navy-800 p-5 sm:p-6', className)}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-brand-400">{children}</p>;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mute">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('flex items-center gap-3', className)}>
      <span className="grid size-11 place-items-center rounded-2xl bg-navy-700 text-brand-400"><Trophy className="size-5" aria-hidden /></span>
      <span className="leading-tight">
        <b className="block text-[15px]">CricketVision <span className="text-brand-400">AI</span></b>
        <small className="text-[11px] text-mute-2">Indian team identification</small>
      </span>
    </span>
  );
}

export function SampleBadge({ children = 'Sample data' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-warn">
      <FlaskConical className="size-3" aria-hidden /> {children}
    </span>
  );
}

export function LiveBadge({ children = 'Your analyses' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ok">
      <span className="size-1.5 rounded-full bg-ok" aria-hidden /> {children}
    </span>
  );
}

export function StatusPill({ matched }: { matched: boolean }) {
  return matched
    ? <span className="inline-flex whitespace-nowrap rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-bold text-brand-400">Possible roster match</span>
    : <span className="inline-flex whitespace-nowrap rounded-full bg-warn/15 px-2.5 py-1 text-[11px] font-bold text-warn">Needs manual verification</span>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-mute-2">
      <Icon className="size-8" aria-hidden />
      <b className="text-sm text-ink-soft">{title}</b>
      <span className="max-w-sm text-xs leading-relaxed">{text}</span>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cx('animate-spin', className)} aria-hidden />;
}

export const inputClass = 'w-full rounded-xl border border-navy-500 bg-navy-900 px-3.5 py-3 text-sm text-white placeholder:text-mute-2 outline-none transition focus:border-brand-400';

export function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: number | string; hint: string }) {
  return (
    <div className="rounded-2xl border border-navy-600 bg-navy-800 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-400/40">
      <div className="flex items-center justify-between text-xs text-mute">
        <span>{label}</span>
        <span className="grid size-9 place-items-center rounded-xl bg-navy-700 text-brand-400"><Icon className="size-4" aria-hidden /></span>
      </div>
      <b className="mt-3 block text-3xl font-extrabold tabular-nums">{value}</b>
      <small className="mt-1 block text-xs text-mute-2">{hint}</small>
    </div>
  );
}

export function Thumb({ src, className }: { src: string | null; className?: string }) {
  return src
    ? <img src={src} alt="Uploaded cricket match" className={cx('rounded-lg object-cover', className)} />
    : <span className={cx('grid place-items-center rounded-lg bg-navy-700 text-mute-2', className)} title="No preview stored for this image"><span className="text-[9px] font-bold uppercase tracking-wide">No preview</span></span>;
}
