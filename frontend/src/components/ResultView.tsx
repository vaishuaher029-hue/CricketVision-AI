
import {
  ScanFace,
  User,
  Hash,
  ShieldCheck,
  AlertCircle,
  Calendar,
  FileImage,
  Activity,
} from 'lucide-react';

import { API, type Analysis } from '../lib/api';

type ResultViewProps = {
  analysis: Analysis;
  thumb?: string | null;
  showLink?: boolean;
};

export function ResultView({
  analysis,
  thumb,
  showLink = false,
}: ResultViewProps) {
  const faceCount =
    typeof analysis.face_count === 'number'
      ? analysis.face_count
      : null;

  const isMatched =
    analysis.status === 'completed' &&
    Boolean(analysis.matched_player);

  const annotatedImageUrl = analysis.annotated_image_url
    ? `${API}${analysis.annotated_image_url}`
    : null;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Analysis result</p>
          <h2 className="text-2xl font-bold text-white">
            Player Identification
          </h2>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            isMatched
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          {isMatched ? 'Match found' : 'Uncertain result'}
        </span>
      </div>

      {/* Uploaded image */}
      {thumb && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h3 className="mb-3 font-semibold text-white">
            Uploaded image
          </h3>
          <img
            src={thumb}
            alt="Uploaded cricket image"
            className="max-h-96 w-full rounded-xl object-contain"
          />
        </div>
      )}

      {/* Player details */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/15 p-3">
            <User className="size-6 text-blue-400" />
          </div>

          <div>
            <p className="text-sm text-slate-400">Identified player</p>
            <h3 className="text-xl font-bold text-white">
              {analysis.matched_player || 'No player match found'}
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-800 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="size-4" />
              <span className="text-sm">Jersey number</span>
            </div>
            <p className="mt-2 text-xl font-bold text-white">
              {analysis.extracted_number || 'Not detected'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="size-4" />
              <span className="text-sm">Printed name</span>
            </div>
            <p className="mt-2 text-xl font-bold text-white">
              {analysis.extracted_name || 'Not detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Detection information */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
        <h3 className="mb-5 text-lg font-semibold text-white">
          Detection information
        </h3>

        <ul className="space-y-4 text-sm text-slate-300">
          <li className="flex items-center gap-3">
            <ScanFace className="size-5 text-blue-400" />
            <span>
              Face detection:{' '}
              {faceCount !== null
                ? `${faceCount} visible face(s) detected`
                : 'Face detection information unavailable'}
            </span>
          </li>

          <li className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-400" />
            <span>
              Player matching:{' '}
              {isMatched
                ? 'A roster match was found'
                : 'No confirmed roster match'}
            </span>
          </li>

          <li className="flex items-center gap-3">
            <FileImage className="size-5 text-blue-400" />
            <span>File: {analysis.filename}</span>
          </li>

          <li className="flex items-center gap-3">
            <Activity className="size-5 text-blue-400" />
            <span>Status: {analysis.status}</span>
          </li>

          <li className="flex items-center gap-3">
            <Calendar className="size-5 text-blue-400" />
            <span>
              Created:{' '}
              {analysis.created_at
                ? new Date(analysis.created_at).toLocaleString()
                : 'Not available'}
            </span>
          </li>
        </ul>
      </div>

      {/* Annotated image */}
      {annotatedImageUrl && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Face detection preview
          </h3>

          <img
            src={annotatedImageUrl}
            alt="Image showing detected face locations"
            className="max-h-[500px] w-full rounded-xl object-contain"
          />

          <p className="mt-3 text-xs text-slate-400">
            Boxes indicate detected face locations only.
            They do not identify people.
          </p>
        </div>
      )}

      {/* Explanation */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
        <div className="mb-3 flex items-center gap-2">
          {isMatched ? (
            <ShieldCheck className="size-5 text-emerald-400" />
          ) : (
            <AlertCircle className="size-5 text-amber-400" />
          )}

          <h3 className="font-semibold text-white">
            Analysis explanation
          </h3>
        </div>

        <p className="text-sm leading-6 text-slate-300">
          {analysis.explanation || 'No additional explanation is available.'}
        </p>
      </div>

      {showLink && (
        <a
          href="/history"
          className="inline-flex text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          View analysis history →
        </a>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Player matching uses visible jersey-number and printed-name
        clues against the demo roster. Face detection counts visible
        faces only; it does not perform facial recognition.
      </p>

    </div>
  );
}
