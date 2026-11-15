import { useEffect, useMemo, useState } from 'react';
import { Info, Search, Users, RefreshCw } from 'lucide-react';
import { MiniJersey } from '../components/JerseyIllustration';
import { ROSTER_IS_VERIFIED } from '../data/sampleRoster';
import { useAuth } from '../lib/auth';

type BackendPlayer = {
  name: string;
  jersey: string | null;
  role: string;
};

type RosterPlayer = BackendPlayer & {
  id: string;
  team: string;
};

export default function Directory({
  initialQuery = '',
}: {
  initialQuery?: string;
}) {
  const { request } = useAuth();

  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPlayers() {
      setLoading(true);
      setError('');

      try {
        const data = await request<BackendPlayer[]>('/players');

        if (!active) return;

        const formattedPlayers = data.map((player, index) => ({
          ...player,
          id: `${player.name}-${index}`,
          team: 'India',
        }));

        setPlayers(formattedPlayers);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load players. Please try again.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPlayers();

    return () => {
      active = false;
    };
  }, [request]);

  const roles = useMemo(
    () => ['All', ...Array.from(new Set(players.map((p) => p.role)))],
    [players],
  );

  const filteredPlayers = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^#/, '');

    return players.filter((player) => {
      const matchesRole = role === 'All' || player.role === role;

      const matchesSearch =
        !term ||
        player.name.toLowerCase().includes(term) ||
        (player.jersey ?? '').toLowerCase().includes(term);

      return matchesRole && matchesSearch;
    });
  }, [players, query, role]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">
              Player Directory
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Search and explore players in the CricketVision AI roster.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2">
          <span className="text-sm text-slate-400">Total players: </span>
          <span className="font-semibold text-white">{players.length}</span>
        </div>
      </div>

      {!ROSTER_IS_VERIFIED && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Demo roster – unverified
            </p>
            <p className="mt-1 text-sm text-slate-300">
              These players are loaded from the backend demo roster. They are
              not an official or verified team list.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search player name or jersey number..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                role === item
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-500'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-slate-300">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading players from backend...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="font-semibold text-red-300">
            Could not load the player directory
          </p>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
          <p className="mt-2 text-sm text-slate-400">
            Check that the backend is running and that you are logged in.
          </p>
        </div>
      )}

      {!loading && !error && filteredPlayers.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-500" />
          <h2 className="mt-3 font-semibold text-white">
            No players found
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Try another player name, jersey number, or role.
          </p>
        </div>
      )}

      {!loading && !error && filteredPlayers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/60"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                  <MiniJersey number={player.jersey} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">
                    {player.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {player.role}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Jersey #{player.jersey ?? 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="text-xs text-slate-400">
                  Backend roster
                </span>

                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                  Demo · Unverified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}