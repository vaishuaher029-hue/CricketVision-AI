import type { Analysis } from './api';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(iso: string): string {
  // The backend stores naive UTC timestamps; treat them as UTC when no zone is present.
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z');
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function isMatched(a: Pick<Analysis, 'matched_player'>): boolean {
  return Boolean(a.matched_player);
}

export const NOT_IDENTIFIED = 'Player Not Identified – Manual Verification Required';

export function statusText(matched: boolean): string {
  return matched ? 'Possible roster match' : 'Manual verification required';
}

export function toCsv(rows: Analysis[]): string {
  const esc = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['id', 'date', 'jersey_number', 'printed_name', 'possible_player', 'status'];
  const lines = rows.map((r) => [r.id, r.created_at, r.extracted_number, r.extracted_name, r.matched_player, statusText(isMatched(r))].map(esc).join(','));
  return [head.join(','), ...lines].join('\n');
}
