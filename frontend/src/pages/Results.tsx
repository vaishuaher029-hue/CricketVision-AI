import { useEffect, useState } from 'react';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { ResultView } from '../components/ResultView';
import { ButtonLink, Card, EmptyState, PageHeader, Spinner } from '../components/ui';
import type { Analysis } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getThumb } from '../lib/thumbs';

export default function Results({ id }: { id: string }) {
  const { request } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setAnalysis(null);
    setError('');
    request<Analysis>(`/analyses/${encodeURIComponent(id)}`).then(setAnalysis).catch((e: Error) => setError(e.message));
  }, [id, request]);

  return (
    <>
      <PageHeader eyebrow={`Workspace / Analysis Results / #${id}`} title="Analysis Results" subtitle="Everything below is exactly what the backend returned for this image." actions={<ButtonLink to="/history" variant="secondary"><ArrowLeft className="size-4" aria-hidden /> History</ButtonLink>} />
      <Card>
        {error ? <EmptyState icon={TriangleAlert} title="Could not load this analysis" text={error} action={<ButtonLink to="/history" variant="secondary">Back to history</ButtonLink>} />
          : !analysis ? <div className="grid min-h-48 place-items-center text-mute"><Spinner className="size-6" /></div>
          : <ResultView analysis={analysis} thumb={getThumb(analysis.id)} />}
      </Card>
    </>
  );
}
