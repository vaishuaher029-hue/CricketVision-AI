import { useEffect, useState } from 'react';
import { RefreshCw, ScanSearch, ShieldCheck } from 'lucide-react';
import { Dropzone, validateImage } from '../components/Dropzone';
import { ResultView } from '../components/ResultView';
import { Button, Card, Eyebrow, PageHeader, Spinner } from '../components/ui';
import { uploadAnalysis } from '../lib/api';
import type { Analysis, UploadStage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { saveThumb, getThumb } from '../lib/thumbs';

export default function Identify() {
  const { token, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage | 'idle'>('idle');
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Analysis | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const busy = stage !== 'idle';

  function choose(f: File) {
    const problem = validateImage(f);
    setResult(null);
    if (problem) { setError(problem); setFile(null); return; }
    setError('');
    setFile(f);
  }

  function reset() { setFile(null); setResult(null); setError(''); setStage('idle'); setPercent(0); }

  async function identify() {
    if (!file) return;
    setError('');
    setResult(null);
    setPercent(0);
    setStage('uploading');
    try {
      const analysis = await uploadAnalysis(file, token, (s, p) => { setStage(s); setPercent(p); });
      await saveThumb(analysis.id, file);
      setResult(analysis);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setStage('idle');
    }
  }

  return (
    <>
      <PageHeader eyebrow="Workspace / Identify Player" title="Player Identification Workspace" subtitle="Upload a cricket image. The backend reads visible jersey numbers and printed names and compares them with roster records." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <Eyebrow>Step 1 · Upload</Eyebrow>
          <Dropzone file={file} previewUrl={preview} disabled={busy} onFile={choose} onClear={reset} />

          {busy && (
            <div className="mt-5" role="status" aria-live="polite">
              <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
                <span className="flex items-center gap-2"><Spinner className="size-3.5 text-brand-400" />{stage === 'uploading' ? 'Uploading image…' : 'Reading jersey number and printed name…'}</span>
                {stage === 'uploading' && <b className="tabular-nums">{percent}%</b>}
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-navy-700">
                {stage === 'uploading'
                  ? <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-200" style={{ width: `${percent}%` }} />
                  : <div className="absolute inset-y-0 w-2/5 animate-indeterminate rounded-full bg-gradient-to-r from-brand-600 to-brand-400" />}
              </div>
            </div>
          )}

          {error && <p role="alert" className="mt-4 text-sm text-bad">{error}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={identify} disabled={!file || busy} className="min-w-44">{busy ? <Spinner className="size-4" /> : <ScanSearch className="size-4" aria-hidden />}{busy ? 'Analyzing…' : 'Identify Player'}</Button>
            {(file || result) && !busy && <Button variant="secondary" onClick={reset}><RefreshCw className="size-4" aria-hidden /> New image</Button>}
          </div>
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-mute-2"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-400" aria-hidden />Only visible text (jersey number, printed name) is analysed. Faces are never identified.</p>
        </Card>

        <Card>
          <Eyebrow>Step 2 · Result</Eyebrow>
          {result ? <ResultView analysis={result} thumb={getThumb(result.id)} showLink /> : (
            <div className="grid min-h-72 place-items-center text-center text-xs leading-relaxed text-mute-2">
              <div className="max-w-xs">
                <ScanSearch className="mx-auto mb-3 size-9" aria-hidden />
                <b className="block text-sm text-ink-soft">{busy ? 'Analysis in progress' : 'No analysis yet'}</b>
                <span>{busy ? 'Results appear here as soon as the backend finishes.' : 'Upload an image and press “Identify Player”. The extracted jersey number, printed name, possible roster match and verification status will appear here.'}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
