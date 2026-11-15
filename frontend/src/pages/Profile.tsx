import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button, Card, Eyebrow, PageHeader } from '../components/ui';
import type { Analysis } from '../lib/api';
import { useAuth } from '../lib/auth';
import { isMatched } from '../lib/format';
import { navigate } from '../lib/router';

export default function Profile() {
  const { user, request, logout } = useAuth();
  const [rows, setRows] = useState<Analysis[]>([]);
  useEffect(() => { request<Analysis[]>('/analyses').then(setRows).catch(() => setRows([])); }, [request]);
  const matched = rows.filter(isMatched).length;

  return (
    <>
      <PageHeader eyebrow="Workspace / Profile" title="User Profile" subtitle="Account details held by the backend." />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#15516b] text-3xl font-extrabold text-[#7de6ef]">{(user?.email || '?').slice(0, 1).toUpperCase()}</div>
          <p className="mt-4 break-all font-bold">{user?.email ?? 'Loading…'}</p>
          <p className="mt-1 text-xs text-mute-2">Account ID {user?.id ?? '—'}</p>
          <Button variant="secondary" className="mt-6 w-full" onClick={() => { logout(); navigate('/'); }}><LogOut className="size-4" aria-hidden /> Sign out</Button>
        </Card>
        <div className="space-y-5">
          <Card>
            <Eyebrow>Account</Eyebrow>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-mute-2">Email</dt><dd className="mt-1 break-all">{user?.email ?? '—'}</dd></div>
              <div><dt className="text-xs text-mute-2">Account ID</dt><dd className="mt-1">{user?.id ?? '—'}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-mute-2">The backend stores only an email address and password hash, so no other profile fields are available.</p>
          </Card>
          <Card>
            <Eyebrow>Your activity</Eyebrow>
            <dl className="grid gap-4 sm:grid-cols-3">
              {[['Images analysed', rows.length], ['Roster matches', matched], ['Need verification', rows.length - matched]].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-navy-900 p-4"><dt className="text-xs text-mute-2">{l}</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums">{v}</dd></div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
