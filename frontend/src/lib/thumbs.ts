// The backend stores uploads but exposes no endpoint to read them back, so a small thumbnail of each
// image the user uploads is kept in this browser only. It is the user's own image, never generated.
const PREFIX = 'cv_thumb_';

export function getThumb(id: number): string | null {
  try { return localStorage.getItem(PREFIX + id); } catch { return null; }
}

export function clearThumbs(): number {
  let removed = 0;
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => { localStorage.removeItem(k); removed += 1; });
  } catch { /* ignore */ }
  return removed;
}

export function saveThumb(id: number, file: File): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const size = 160;
        const scale = Math.min(1, size / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        localStorage.setItem(PREFIX + id, canvas.toDataURL('image/jpeg', 0.7));
      } catch { /* quota or canvas unavailable: skip */ }
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    img.src = url;
  });
}
