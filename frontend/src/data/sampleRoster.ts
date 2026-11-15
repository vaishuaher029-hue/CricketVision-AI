// SAMPLE ROSTER – NOT VERIFIED.
// These five records mirror the illustrative demo roster used by the backend (backend/app/vision.py).
// Squad membership, jersey numbers and roles have NOT been checked against an official source.
// Replace this file with verified roster data (or a backend endpoint) before any real use.
export type RosterPlayer = {
  id: string;
  name: string;
  jersey: string | null;
  role: string;
  team: string;
};

export const ROSTER_IS_VERIFIED = false;

export const sampleRoster: RosterPlayer[] = [
  { id: 'p-rohit', name: 'Rohit Sharma', jersey: '45', role: 'Batter', team: 'India' },
  { id: 'p-virat', name: 'Virat Kohli', jersey: '18', role: 'Batter', team: 'India' },
  { id: 'p-hardik', name: 'Hardik Pandya', jersey: '33', role: 'All-rounder', team: 'India' },
  { id: 'p-jasprit', name: 'Jasprit Bumrah', jersey: '93', role: 'Bowler', team: 'India' },
  { id: 'p-ravindra', name: 'Ravindra Jadeja', jersey: '8', role: 'All-rounder', team: 'India' },
];
