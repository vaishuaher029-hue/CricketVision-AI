import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, navigate, scrollToId } from '../lib/router';
import { useAuth } from '../lib/auth';
import { ButtonLink, Logo } from './ui';

const links = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'responsible-ai', label: 'Responsible AI' },
];

export function PublicNav({ onLanding }: { onLanding: boolean }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);

  function go(id: string) {
    setOpen(false);
    if (onLanding) scrollToId(id);
    else { navigate('/'); setTimeout(() => scrollToId(id), 80); }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-600/50 bg-navy-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => <button key={l.id} type="button" onClick={() => go(l.id)} className="cursor-pointer text-sm text-mute transition hover:text-white">{l.label}</button>)}
          <Link to="/directory" className="text-sm text-mute transition hover:text-white">Player Directory</Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {token ? <ButtonLink to="/dashboard" className="!py-2.5">Open dashboard</ButtonLink> : (<><ButtonLink to="/login" variant="ghost" className="!py-2.5">Sign in</ButtonLink><ButtonLink to="/register" className="!py-2.5">Get started</ButtonLink></>)}
        </div>
        <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid size-10 cursor-pointer place-items-center rounded-lg text-ink-soft hover:bg-navy-800 md:hidden">
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-navy-600/50 px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => <button key={l.id} type="button" onClick={() => go(l.id)} className="block w-full cursor-pointer rounded-lg px-3 py-3 text-left text-sm text-ink-soft hover:bg-navy-800">{l.label}</button>)}
          <Link to="/directory" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-ink-soft hover:bg-navy-800">Player Directory</Link>
          <div className="flex gap-3 pt-2">
            {token ? <ButtonLink to="/dashboard" className="flex-1">Open dashboard</ButtonLink> : (<><ButtonLink to="/login" variant="secondary" className="flex-1">Sign in</ButtonLink><ButtonLink to="/register" className="flex-1">Get started</ButtonLink></>)}
          </div>
        </div>
      )}
    </header>
  );
}
