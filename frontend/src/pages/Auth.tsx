import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, ShieldCheck, Trophy } from 'lucide-react';
import { Button, Eyebrow, inputClass, Spinner } from '../components/ui';
import { JerseyIllustration } from '../components/JerseyIllustration';
import { Link, navigate } from '../lib/router';
import { useAuth } from '../lib/auth';

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const isLogin = mode === 'login';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (isLogin) {
        await login(email.trim(), password); // the router redirects once the token is set
      } else {
        await register(email.trim(), password);
        setPassword('');
        setNotice('Account created. Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-hero grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-navy-600/50 bg-navy-900/40 p-12 lg:flex">
        <Link to="/" className="flex items-center gap-3 font-bold"><span className="grid size-11 place-items-center rounded-2xl bg-navy-700 text-brand-400"><Trophy className="size-5" aria-hidden /></span>CricketVision <span className="-ml-2 text-brand-400">AI</span></Link>
        <div className="mx-auto w-72"><JerseyIllustration showScan={false} /></div>
        <p className="max-w-sm text-sm leading-relaxed text-mute"><ShieldCheck className="mb-2 size-5 text-brand-400" aria-hidden />Identification is based on visible jersey numbers and printed names only. No facial recognition.</p>
      </div>
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-navy-600 bg-navy-800 p-8 shadow-2xl shadow-black/40 sm:p-9">
          <Eyebrow>Cricket intelligence workspace</Eyebrow>
          <h1 className="text-3xl font-extrabold tracking-tight">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">{isLogin ? 'Sign in to identify Indian cricket team members from match images.' : 'Register to save and review your player identification analyses.'}</p>
          <form onSubmit={submit} className="mt-7 grid gap-1.5">
            <label htmlFor="email" className="mt-2 text-xs text-ink-soft">Email</label>
            <input id="email" type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <label htmlFor="password" className="mt-3 text-xs text-ink-soft">Password</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} className={`${inputClass} pr-11`} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-mute hover:text-white">{show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}</button>
            </div>
            {!isLogin && <p className="text-[11px] text-mute-2">At least 8 characters.</p>}
            <Button type="submit" disabled={busy} className="mt-5 w-full">{busy && <Spinner className="size-4" />}{isLogin ? 'Sign in' : 'Create account'}</Button>
          </form>
          {error && <p role="alert" className="mt-4 text-sm text-bad">{error}</p>}
          {notice && <p role="status" className="mt-4 text-sm text-ok">{notice}</p>}
          <p className="mt-6 text-sm text-mute">
            {isLogin ? 'New here? ' : 'Already registered? '}
            <Link to={isLogin ? '/register' : '/login'} className="font-bold text-brand-400 hover:underline">{isLogin ? 'Create an account' : 'Sign in'}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
