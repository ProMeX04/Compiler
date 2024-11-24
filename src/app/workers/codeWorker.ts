import { PistonExecuteRequest, PistonExecuteResponse } from '../types/piston'

const PISTON_API = 'https://emkc.org/api/v2/piston';

self.addEventListener('message', async (e: MessageEvent<PistonExecuteRequest>) => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e.data),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result: PistonExecuteResponse = await response.json();
    self.postMessage({ type: 'success', data: result });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? (error as Error).message : 'Unknown error',
      isTimeout: (error as Error).name === 'AbortError'
    });
  } finally {
    clearTimeout(timeoutId);
  }
});

export {}