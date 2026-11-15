import { useCallback, useEffect, useState } from 'react';

export type DashboardSource = 'auto' | 'sample' | 'live';
export type Settings = { reduceMotion: boolean; dashboardSource: DashboardSource };

const KEY = 'cv_settings';
const DEFAULTS: Settings = { reduceMotion: false, dashboardSource: 'auto' };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function applyMotion(reduce: boolean): void {
  document.documentElement.dataset.motion = reduce ? 'off' : 'on';
}

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(load);
  useEffect(() => { applyMotion(settings.reduceMotion); }, [settings.reduceMotion]);
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return [settings, update];
}
