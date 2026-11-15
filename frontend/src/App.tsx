import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppShell } from './components/AppShell';
import { PublicNav } from './components/PublicNav';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import History from './pages/History';
import Identify from './pages/Identify';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Results from './pages/Results';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './lib/auth';
import { navigate, useRoute } from './lib/router';
import { useSettings } from './lib/settings';

const PROTECTED = ['/dashboard', '/identify', '/history', '/profile', '/settings'];

function Router() {
  const { path, query } = useRoute();
  const { token } = useAuth();
  useSettings(); // applies the saved motion preference on load

  const protectedRoute = PROTECTED.includes(path) || path.startsWith('/results/');
  const guest = path === '/login' || path === '/register';

  useEffect(() => {
    if (protectedRoute && !token) {
      try { sessionStorage.setItem('cv_next', path); } catch { /* ignore */ }
      navigate('/login');
    } else if (guest && token) {
      let next = '/dashboard';
      try { next = sessionStorage.getItem('cv_next') || next; sessionStorage.removeItem('cv_next'); } catch { /* ignore */ }
      navigate(next);
    }
  }, [protectedRoute, guest, token, path]);

  if (path === '/') return <Landing />;
  if (guest) return token ? null : <Auth mode={path === '/register' ? 'register' : 'login'} />;
  if (protectedRoute && !token) return null;

  const shell = (page: ReactNode) => <AppShell path={path}>{page}</AppShell>;
  if (path === '/dashboard') return shell(<Dashboard />);
  if (path === '/identify') return shell(<Identify />);
  if (path === '/history') return shell(<History />);
  if (path === '/profile') return shell(<Profile />);
  if (path === '/settings') return shell(<Settings />);
  if (path.startsWith('/results/')) return shell(<Results id={path.slice('/results/'.length)} />);
  if (path === '/directory') {
    const page = <Directory initialQuery={query.get('q') ?? ''} />;
    return token ? shell(page) : (
      <div className="bg-hero min-h-screen"><PublicNav onLanding={false} /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">{page}</main></div>
    );
  }
  return (
    <div className="bg-hero grid min-h-screen place-items-center p-6 text-center">
      <div><h1 className="text-3xl font-extrabold">Page not found</h1><p className="mt-2 text-sm text-mute">The page you are looking for does not exist.</p><a href="#/" className="mt-5 inline-block font-bold text-brand-400">Back to home</a></div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>;
}
