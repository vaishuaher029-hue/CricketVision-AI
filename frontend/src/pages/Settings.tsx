import { useState } from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { Button, Card, Eyebrow, PageHeader } from '../components/ui';
import { API } from '../lib/api';
import { cx } from '../lib/format';
import { clearThumbs } from '../lib/thumbs';
import { useSettings } from '../lib/settings';
import type { DashboardSource } from '../lib/settings';

export default function Settings() {
  const [settings, update] = useSettings();
  const [health, setHealth] = useState('');
  const [cleared, setCleared] = useState('');

  async function check() {
    setHealth('Checking…');
    try {
      const res = await fetch(`${API}/health`);
      setHealth(res.ok ? 'Backend is reachable and healthy.' : `Backend responded with status ${res.status}.`);
    } catch {
      setHealth('Backend could not be reached.');
    }
  }

  const sources: Array<[DashboardSource, string, string]> = [
    ['auto', 'Automatic', 'My analyses when available, otherwise sample data'],
    ['live', 'My analyses', 'Always start with real results'],
    ['sample', 'Sample data', 'Always start with the demonstration data'],
  ];

  return (
    <>
      <PageHeader eyebrow="Workspace / Settings" title="Settings" subtitle="Preferences are stored in this browser only." />
      <div className="max-w-3xl space-y-5">
        <Card>
          <Eyebrow>Dashboard</Eyebrow>
          <fieldset>
            <legend className="mb-3 text-sm font-bold">Default data source</legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {sources.map(([id, label, text]) => (
                <label key={id} className={cx('cursor-pointer rounded-xl border p-4 text-xs transition focus-within:border-brand-400', settings.dashboardSource === id ? 'border-brand-400/60 bg-brand-500/10' : 'border-navy-600 hover:border-navy-500')}>
                  <input type="radio" name="source" className="sr-only" checked={settings.dashboardSource === id} onChange={() => update({ dashboardSource: id })} />
                  <b className="block text-sm text-ink">{label}</b><span className="mt-1 block leading-relaxed text-mute">{text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
        <Card>
          <Eyebrow>Appearance</Eyebrow>
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span><b className="block text-sm">Reduce motion</b><span className="text-xs text-mute">Turns off floating and fade animations.</span></span>
            <input type="checkbox" role="switch" className="size-5 accent-brand-500" checked={settings.reduceMotion} onChange={(e) => update({ reduceMotion: e.target.checked })} />
          </label>
        </Card>
        <Card>
          <Eyebrow>Connection</Eyebrow>
          <p className="text-xs text-mute-2">API address</p>
          <code className="mt-1 block break-all rounded-lg bg-navy-900 px-3 py-2 text-xs text-ink-soft">{API}</code>
          <div className="mt-4 flex flex-wrap items-center gap-3"><Button variant="secondary" onClick={check}><Activity className="size-4" aria-hidden /> Check backend</Button><span className="text-xs text-mute" aria-live="polite">{health}</span></div>
          <p className="mt-3 text-[11px] text-mute-2">Change it with <code>VITE_API_URL</code> in <code>frontend/.env.local</code>.</p>
        </Card>
        <Card>
          <Eyebrow>Local data</Eyebrow>
          <p className="text-sm text-ink-soft">Thumbnails of images you upload are cached in this browser because the backend does not serve images back. Clearing them does not delete any analysis.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3"><Button variant="secondary" onClick={() => setCleared(`Removed ${clearThumbs()} cached thumbnail(s).`)}><Trash2 className="size-4" aria-hidden /> Clear cached thumbnails</Button><span className="text-xs text-mute" aria-live="polite">{cleared}</span></div>
        </Card>
        <Card>
          <Eyebrow>Security</Eyebrow>
          <p className="text-sm text-ink-soft">Password changes are not supported by the current backend, so no option is offered here.</p>
        </Card>
      </div>
    </>
  );
}
