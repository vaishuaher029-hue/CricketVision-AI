import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

// Hash routing keeps Vite dev, preview and Docker working without any server rewrite rules.
type Route = { path: string; query: URLSearchParams };

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(search) };
}

export function navigate(to: string): void {
  window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  const onChange = useCallback(() => {
    setRoute(parse());
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [onChange]);
  return route;
}

export function Link({ to, className, children, onClick, ariaCurrent }: { to: string; className?: string; children: ReactNode; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void; ariaCurrent?: boolean }) {
  return <a href={`#${to}`} className={className} onClick={onClick} aria-current={ariaCurrent ? 'page' : undefined}>{children}</a>;
}

export function scrollToId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
