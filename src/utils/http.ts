/**
 * Small fetch helper shared by the OSRM and Nominatim clients: JSON only, a
 * hard timeout, and caller cancellation that is never confused with a timeout.
 */

export function createAbortError(): Error {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError';
}

/** Resolves after `ms`, or rejects with an AbortError as soon as `signal` aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(createAbortError());
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export interface FetchJsonOptions {
  signal?: AbortSignal;
  timeoutMs: number;
  /** Builds the error thrown for HTTP / network / timeout failures. */
  makeError: (message: string) => Error;
}

export async function fetchJson(url: string, { signal, timeoutMs, makeError }: FetchJsonOptions): Promise<any> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();

  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    if (signal?.aborted) throw createAbortError();
    if (timedOut) throw makeError(`request timed out after ${timeoutMs} ms`);
    throw makeError(err instanceof Error ? err.message : 'request failed');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}
