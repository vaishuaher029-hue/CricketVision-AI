import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cx } from '../lib/format';

export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 8 * 1024 * 1024; // matches the backend limit

export function validateImage(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Unsupported file type. Please upload a JPG, PNG or WEBP image.';
  if (file.size > MAX_BYTES) return 'Image must be 8 MB or smaller.';
  if (file.size === 0) return 'The selected image is empty.';
  return null;
}

export function Dropzone({ file, previewUrl, disabled, onFile, onClear }: { file: File | null; previewUrl: string | null; disabled?: boolean; onFile: (f: File) => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }

  if (file && previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-navy-500 bg-navy-900">
        <img src={previewUrl} alt="Selected cricket image preview" className="mx-auto max-h-96 w-full object-contain" />
        <div className="flex items-center justify-between gap-3 border-t border-navy-600 px-4 py-3 text-xs">
          <span className="truncate text-ink-soft">{file.name}</span>
          <span className="shrink-0 text-mute-2">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        {!disabled && (
          <button type="button" onClick={onClear} aria-label="Remove image" className="absolute right-3 top-3 grid size-9 cursor-pointer place-items-center rounded-full bg-navy-950/80 text-white backdrop-blur transition hover:bg-navy-950"><X className="size-4" aria-hidden /></button>
        )}
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={cx('flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-navy-900 px-6 py-10 text-center transition focus-within:border-brand-400', drag ? 'border-brand-400 bg-navy-700/50' : 'border-[#37617e] hover:border-brand-400/70')}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-navy-700 text-brand-400"><ImagePlus className="size-7" aria-hidden /></span>
      <b className="text-sm text-[#d9e8f7]">{drag ? 'Drop the image to upload' : 'Drag & drop a cricket image here'}</b>
      <span className="text-xs text-mute-2">or click to browse · JPG, PNG or WEBP · up to 8 MB</span>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={disabled} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
    </label>
  );
}
