import type { Analysis } from './api';
import { isMatched } from './format';
import { getThumb } from './thumbs';

export type Point = { label: string; value: number };
export type RecentRow = {
  key: string;
  thumb: string | null;
  number: string | null;
  name: string | null;
  player: string | null;
  matched: boolean;
  date: string;
  href?: string;
};
export type DashData = {
  total: number;
  matched: number;
  numbers: number;
  pending: number;
  activity: Point[];
  players: Point[];
  numberFreq: Point[];
  recent: RecentRow[];
};

const DAYS = 14;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function parseUtc(iso: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z');
}

export function emptyActivity(): Point[] {
  const out: Point[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({ label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), value: 0 });
  }
  return out;
}

/** Every number here is computed from real analysis records returned by the backend. */
export function computeLive(analyses: Analysis[]): DashData {
  const activity = emptyActivity();
  const today = new Date();
  const index = new Map<string, number>();
  for (let i = 0; i < DAYS; i += 1) index.set(dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1 - i))), i);

  const players = new Map<string, number>();
  const numbers = new Map<string, number>();
  let matched = 0;
  let detected = 0;
  for (const a of analyses) {
    const idx = index.get(dayKey(parseUtc(a.created_at)));
    if (idx !== undefined) activity[idx].value += 1;
    if (isMatched(a) && a.matched_player) { matched += 1; players.set(a.matched_player, (players.get(a.matched_player) || 0) + 1); }
    if (a.extracted_number) { detected += 1; numbers.set(`#${a.extracted_number}`, (numbers.get(`#${a.extracted_number}`) || 0) + 1); }
  }
  const sorted = (m: Map<string, number>): Point[] => [...m.entries()].map(([label, value]) => ({ label, value })).sort((x, y) => y.value - x.value);
  return {
    total: analyses.length,
    matched,
    numbers: detected,
    pending: analyses.length - matched,
    activity,
    players: sorted(players),
    numberFreq: sorted(numbers).slice(0, 8),
    recent: analyses.slice(0, 6).map((a) => ({
      key: `live-${a.id}`,
      thumb: getThumb(a.id),
      number: a.extracted_number,
      name: a.extracted_name,
      player: a.matched_player,
      matched: isMatched(a),
      date: a.created_at,
      href: `/results/${a.id}`,
    })),
  };
}
