
export const API = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const TOKEN_KEY = 'cv_token';

export type User = {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
};

export type Analysis = {
  id: number;
  filename: string;
  status: string;
  extracted_number: string | null;
  extracted_name: string | null;
  matched_player: string | null;
  confidence: number;
  explanation: string;
  face_count?: number;
  annotated_image_url?: string;
  created_at: string;
};

export type UploadStage = 'uploading' | 'processing';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export async function apiRequest<T>(
  path: string,
  token: string = '',
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  const authToken = token || getToken();

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const endpoint = path.startsWith('/') ? path : `/${path}`;

  let response: Response;

  try {
    response = await fetch(`${API}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(`Cannot connect to backend: ${API}`, 0);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      message = data.detail || data.message || data.error || message;
    } catch {
      // Keep the default error message.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function uploadAnalysis(
  file: File,
  token: string,
  onProgress?: (stage: UploadStage, percent: number) => void
): Promise<Analysis> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);

    xhr.open('POST', `${API}/analyses`);

    const authToken = token || getToken();

    if (authToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round(
          (event.loaded / event.total) * 100
        );

        onProgress?.('uploading', percent);
      }
    });

    xhr.upload.addEventListener('load', () => {
      onProgress?.('processing', 100);
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as Analysis);
        } catch {
          reject(new ApiError('Invalid response received from server.', xhr.status));
        }
        return;
      }

      let message = `Request failed with status ${xhr.status}`;

      try {
        const data = JSON.parse(xhr.responseText);
        message = data.detail || data.message || data.error || message;
      } catch {
        // Keep the default error message.
      }

      reject(new ApiError(message, xhr.status));
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError(`Cannot connect to backend: ${API}`, 0));
    });

    xhr.addEventListener('abort', () => {
      reject(new ApiError('Image upload was cancelled.', 0));
    });

    onProgress?.('uploading', 0);
    xhr.send(formData);
  });
}
