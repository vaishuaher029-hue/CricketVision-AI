// SAMPLE DATA – for demonstration only. None of these values come from the backend or from real analyses.
import type { DashData } from '../lib/stats';

function daysAgo(n: number, hour = 11): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 20, 0, 0);
  return d.toISOString();
}

export function buildSampleData(): DashData {
  const counts = [3, 5, 4, 8, 6, 9, 5, 7, 11, 8, 6, 12, 10, 9];
  const today = new Date();
  const activity = counts.map((value, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (counts.length - 1 - i));
    return { label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), value };
  });
  return {
    total: 128,
    matched: 83,
    numbers: 97,
    pending: 45,
    activity,
    players: [
      { label: 'Virat Kohli', value: 24 },
      { label: 'Rohit Sharma', value: 21 },
      { label: 'Jasprit Bumrah', value: 15 },
      { label: 'Hardik Pandya', value: 13 },
      { label: 'Ravindra Jadeja', value: 10 },
    ],
    numberFreq: [
      { label: '#18', value: 26 },
      { label: '#45', value: 22 },
      { label: '#93', value: 16 },
      { label: '#33', value: 14 },
      { label: '#8', value: 11 },
      { label: '#7', value: 8 },
    ],
    recent: [
      { key: 's1', thumb: null, number: '18', name: 'Kohli', player: 'Virat Kohli', matched: true, date: daysAgo(0, 10) },
      { key: 's2', thumb: null, number: '45', name: 'Sharma', player: 'Rohit Sharma', matched: true, date: daysAgo(0, 8) },
      { key: 's3', thumb: null, number: null, name: null, player: null, matched: false, date: daysAgo(1, 17) },
      { key: 's4', thumb: null, number: '93', name: 'Bumrah', player: 'Jasprit Bumrah', matched: true, date: daysAgo(2, 15) },
      { key: 's5', thumb: null, number: '7', name: null, player: null, matched: false, date: daysAgo(3, 12) },
    ],
  };
}
