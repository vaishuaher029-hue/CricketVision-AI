import { useEffect, useMemo, useState } from 'react';
import { Download, History as HistoryIcon, RefreshCw, Search } from 'lucide-react';
import { Button, ButtonLink, Card, EmptyState, PageHeader, Spinner, StatusPill, Thumb, inputClass } from '../components/ui';
import type { Analysis } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cx, formatDate, isMatched, toCsv } from '../lib/format';
import { Link } from '../lib/router';
import { getThumb } from '../lib/thumbs';

type Filter = 'all' | 'matched' | 'pending';

export default function History() {
  const { request } = useAuth();
  const [rows, setRows] = useState<Analysis[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  function load() {
    setError('');
    request<Analysis[]>('/analyses').then(setRows).catch((e: Error) => { setError(e.message); setRows([]); });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [request]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/^#/, '');
    return (rows ?? []).filter((r) => {
      if (filter === 'matched' && !isMatched(r)) return false;
      if (filter === 'pending' && isMatched(r)) return false;
      if (!term) return true;
      return [r.extracted_number, r.extracted_name, r.matched_player].some((v) => (v ?? '').toLowerCase().includes(term));
    });
  }, [rows, q, filter]);

  function exportCsv() {
    const blob = new Blob([toCsv(shown)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cricketvision-analyses.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader eyebrow="Workspace / Analysis History" title="Analysis History" subtitle="Every image you have analysed, exactly as returned by the backend."
        actions={<div className="flex gap-2"><Button variant="secondary" onClick={load}><RefreshCw className="size-4" aria-hidden /> Refresh</Button><Button variant="secondary" onClick={exportCsv} disabled={shown.length === 0}><Download className="size-4" aria-hidden /> Export CSV</Button></div>} />
      <Card>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-2" aria-hidden />
            <input type="search" aria-label="Search analyses" className={`${inputClass} pl-10`} placeholder="Search by jersey number, printed name or player…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter by status">
            {([['all', 'All'], ['matched', 'Roster match'], ['pending', 'Needs verification']] as const).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={cx('cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition', filter === id ? 'border-brand-400/60 bg-brand-500/15 text-brand-400' : 'border-navy-600 text-mute hover:text-white')}>{label}</button>
            ))}
          </div>
        </div>
        {error && <p role="alert" className="mb-3 text-sm text-bad">{error}</p>}
        {rows === null ? <div className="grid min-h-40 place-items-center text-mute"><Spinner className="size-6" /></div>
          : rows.length === 0 ? <EmptyState icon={HistoryIcon} title="No analyses yet" text="Your uploaded image results will appear here." action={<ButtonLink to="/identify">Identify Player</ButtonLink>} />
          : shown.length === 0 ? <EmptyState icon={Search} title="No matching records" text="Try a different search or filter." />
          : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-left text-xs">
                <thead><tr className="text-mute-2">{['Image', 'Jersey number', 'Printed name', 'Possible player', 'Status', 'Date', ''].map((h, i) => <th key={i} className="border-b border-navy-500 px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} className="transition hover:bg-navy-700/30">
                      <td className="border-b border-navy-600 px-3 py-3"><Thumb src={getThumb(r.id)} className="size-11" /></td>
                      <td className="border-b border-navy-600 px-3 py-3 font-bold text-ink-soft">{r.extracted_number ? `#${r.extracted_number}` : '—'}</td>
                      <td className="border-b border-navy-600 px-3 py-3 text-ink-soft">{r.extracted_name ?? '—'}</td>
                      <td className="border-b border-navy-600 px-3 py-3 text-ink-soft">{r.matched_player ?? '—'}</td>
                      <td className="border-b border-navy-600 px-3 py-3"><StatusPill matched={isMatched(r)} /></td>
                      <td className="whitespace-nowrap border-b border-navy-600 px-3 py-3 text-mute">{formatDate(r.created_at)}</td>
                      <td className="border-b border-navy-600 px-3 py-3 text-right"><Link to={`/results/${r.id}`} className="font-bold text-brand-400 hover:underline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>
    </>
  );
}
