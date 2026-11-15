import { useState } from 'react';
import type { ReactNode } from 'react';
import { History, LayoutDashboard, LogOut, Menu, Search, Settings as SettingsIcon, ShieldCheck, User, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, navigate } from '../lib/router';
import { useAuth } from '../lib/auth';
import { cx } from '../lib/format';
import { Logo } from './ui';

const nav: Array<{ to: string; label: string; icon: LucideIcon; match: (p: string) => boolean }> = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
  { to: '/identify', label: 'Identify Player', icon: Search, match: (p) => p === '/identify' || p.startsWith('/results') },
  { to: '/directory', label: 'Player Directory', icon: Users, match: (p) => p === '/directory' },
  { to: '/history', label: 'Analysis History', icon: History, match: (p) => p === '/history' },
  { to: '/profile', label: 'Profile', icon: User, match: (p) => p === '/profile' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, match: (p) => p === '/settings' },
];

export function AppShell({ path, children }: { path: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initial = (user?.email || '?').slice(0, 1).toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col p-5">
      <Link to="/" className="mb-8 block px-1" onClick={() => setOpen(false)}><Logo /></Link>
      <nav className="grid gap-1.5" aria-label="Main">
        {nav.map(({ to, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <Link key={to} to={to} ariaCurrent={active} onClick={() => setOpen(false)} className={cx('flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition', active ? 'bg-navy-700 text-brand-400' : 'text-mute hover:bg-navy-800 hover:text-white')}>
              <Icon className="size-[18px]" aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="flex gap-2.5 rounded-xl bg-[#102b40] p-3.5 text-[11px] leading-relaxed text-brand-400">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          <span>Evidence-based matching<br /><small className="text-mute">No facial recognition</small></span>
        </div>
        <button type="button" onClick={() => { logout(); navigate('/'); }} className="mt-2.5 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[13px] text-mute transition hover:bg-navy-800 hover:text-white">
          <LogOut className="size-[18px]" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-61 border-r border-navy-600/70 bg-navy-900 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 cursor-default bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85%] border-r border-navy-600 bg-navy-900">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid size-9 cursor-pointer place-items-center rounded-lg text-mute hover:text-white"><X className="size-5" aria-hidden /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-61">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-600/60 bg-navy-950/85 px-4 py-3 backdrop-blur sm:px-8">
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid size-10 cursor-pointer place-items-center rounded-lg text-ink-soft hover:bg-navy-800 lg:hidden"><Menu className="size-5" aria-hidden /></button>
          <span className="hidden text-xs text-mute-2 lg:block">Indian Cricket Team Member Identification</span>
          <Link to="/profile" className="flex items-center gap-3 rounded-full py-1 pl-3 pr-1 text-xs text-mute transition hover:text-white">
            <span className="hidden max-w-48 truncate sm:block">{user?.email}</span>
            <span className="grid size-9 place-items-center rounded-full bg-[#15516b] font-extrabold text-[#7de6ef]">{initial}</span>
          </Link>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <div key={path} className="animate-fade-up">{children}</div>
          <footer className="pt-6 text-[11px] leading-relaxed text-[#627e99]">CricketVision AI · OCR-based visual clues matched against a roster · Always verify results manually.</footer>
        </main>
      </div>
    </div>
  );
}
