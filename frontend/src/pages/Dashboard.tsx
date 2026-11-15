import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, Hash, Image as ImageIcon, ClipboardCheck, TriangleAlert, Upload } from 'lucide-react';
import { ActivityChart, BarList, ChartCard, Donut } from '../components/Charts';
import { ButtonLink, Card, EmptyState, LiveBadge, PageHeader, SampleBadge, StatCard, StatusPill, Thumb } from '../components/ui';
import { buildSampleData } from '../data/sampleDashboard';
import type { Analysis } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cx, formatDate } from '../lib/format';
import { Link } from '../lib/router';
import { useSettings } from '../lib/settings';
import { computeLive } from '../lib/stats';

export default function Dashboard() {
  const { request } = useAuth();
  const [settings] = useSettings();
  const [analyses, setAnalyses] = useState<Analysis[] | null>(null);
  const [error, setError] = useState('');
  const [choice, setChoice] = useState<'sample' | 'live' | null>(null);

  useEffect(() => {
    request<Analysis[]>('/analyses').then(setAnalyses).catch((e: Error) => { setError(e.message); setAnalyses([]); });
  }, [request]);

  const hasLive = (analyses?.length ?? 0) > 0;
  const preferred = settings.dashboardSource === 'auto' ? (hasLive ? 'live' : 'sample') : settings.dashboardSource;
  const source = choice ?? preferred;
  const sample = source === 'sample';
  const data = useMemo(() => (sample ? buildSampleData() : computeLive(analyses ?? [])), [sample, analyses]);

  return (
    <>
      <PageHeader eyebrow="Workspace / Dashboard" title="Indian Cricket Analytics Dashboard" subtitle="Overview of player identification activity, jersey number detection and roster matching." actions={<ButtonLink to="/identify"><Upload className="size-4" aria-hidden /> Identify Player</ButtonLink>} />

      <div role="group" aria-label="Data source" className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-navy-600 bg-navy-800 p-1 text-xs font-bold">
          {([['live', 'My analyses'], ['sample', 'Sample data']] as const).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={source === id} onClick={() => setChoice(id)} className={cx('cursor-pointer rounded-lg px-4 py-2 transition', source === id ? 'bg-navy-700 text-brand-400' : 'text-mute hover:text-white')}>{label}</button>
          ))}
        </div>
        {sample ? <SampleBadge>Sample data – demonstration only</SampleBadge> : <LiveBadge>Live – computed from your saved analyses</LiveBadge>}
      </div>

      {sample && (
        <div className="mb-5 flex gap-3 rounded-xl border border-warn/30 bg-warn/10 p-4 text-xs leading-relaxed text-warn" role="note">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Every number, chart and record on this screen is <b>sample data for demonstration</b>. It is not read from the backend and does not reflect real analyses. Switch to “My analyses” to see actual results.</span>
        </div>
      )}
      {error && <p role="alert" className="mb-4 text-sm text-bad">{error}</p>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ImageIcon} label="Total Images Analyzed" value={data.total} hint={sample ? 'Sample value' : 'Saved to your workspace'} />
        <StatCard icon={CircleCheck} label="Indian Players Matched" value={data.matched} hint={sample ? 'Sample value' : 'Roster clue matches'} />
        <StatCard icon={Hash} label="Jersey Numbers Detected" value={data.numbers} hint={sample ? 'Sample value' : 'Images with a readable number'} />
        <StatCard icon={ClipboardCheck} label="Pending Verifications" value={data.pending} hint={sample ? 'Sample value' : 'No roster match – verify manually'} />
      </div>

      {!sample && analyses !== null && !hasLive && (
        <Card className="mb-5"><EmptyState icon={ImageIcon} title="No analyses yet" text="Upload a cricket image in the identification workspace. Your real results will populate these charts." action={<ButtonLink to="/identify">Identify Player</ButtonLink>} /></Card>
      )}

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Player identification activity" subtitle="Images analyzed per day · last 14 days" rows={data.activity} valueLabel="Images" badge={sample ? <SampleBadge>Sample</SampleBadge> : undefined}>
          <ActivityChart data={data.activity} />
        </ChartCard>
        <ChartCard title="Indian team player distribution" subtitle="Roster players matched across analyses" rows={data.players} valueLabel="Matches" badge={sample ? <SampleBadge>Sample</SampleBadge> : undefined}>
          <BarList data={data.players} empty="No roster matches yet." />
        </ChartCard>
        <ChartCard title="Jersey number detection" subtitle="Most frequently detected numbers" rows={data.numberFreq} valueLabel="Detections" badge={sample ? <SampleBadge>Sample</SampleBadge> : undefined}>
          <BarList data={data.numberFreq} colorClass="bg-series-3" empty="No jersey numbers detected yet." />
        </ChartCard>
        <ChartCard title="Roster match results" subtitle="Successful vs unsuccessful roster matches" rows={[{ label: 'Successful matches', value: data.matched }, { label: 'Unsuccessful matches', value: data.pending }]} valueLabel="Images" badge={sample ? <SampleBadge>Sample</SampleBadge> : undefined}>
          <Donut a={data.matched} b={data.pending} labelA="Successful matches" labelB="Unsuccessful – manual check" empty="No analyses yet." />
        </ChartCard>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-bold">Recent identifications</h3><p className="mt-1 text-xs text-mute">Latest analysis records</p></div>
          <div className="flex items-center gap-3">{sample && <SampleBadge>Sample records</SampleBadge>}{!sample && hasLive && <Link to="/history" className="text-xs font-bold text-brand-400 hover:underline">View all →</Link>}</div>
        </div>
        {data.recent.length === 0 ? <EmptyState icon={ImageIcon} title="Nothing here yet" text="Analysed images will be listed here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-left text-xs">
              <thead><tr className="text-mute-2">{['Image', 'Jersey number', 'Printed name', 'Possible player', 'Match status', 'Analysis date'].map((h) => <th key={h} className="border-b border-navy-500 px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr key={r.key} className="transition hover:bg-navy-700/30">
                    <td className="border-b border-navy-600 px-3 py-3"><Thumb src={r.thumb} className="size-11" /></td>
                    <td className="border-b border-navy-600 px-3 py-3 font-bold text-ink-soft">{r.number ? `#${r.number}` : '—'}</td>
                    <td className="border-b border-navy-600 px-3 py-3 text-ink-soft">{r.name ?? '—'}</td>
                    <td className="border-b border-navy-600 px-3 py-3 text-ink-soft">{r.href ? (r.player ? <Link to={r.href} className="font-bold text-brand-400 hover:underline">{r.player}</Link> : '—') : (r.player ?? '—')}</td>
                    <td className="border-b border-navy-600 px-3 py-3"><StatusPill matched={r.matched} /></td>
                    <td className="whitespace-nowrap border-b border-navy-600 px-3 py-3 text-mute">{formatDate(r.date)}</td>
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
