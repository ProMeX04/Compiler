import { PistonExecuteRequest, PistonExecuteResponse, PistonRuntime } from '../types/piston';

const PISTON_API = 'https://emkc.org/api/v2/piston';

export const executeCode = async (params: PistonExecuteRequest): Promise<PistonExecuteResponse> => {
  const response = await fetch(`${PISTON_API}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = await response.json();
  if (!result || !result.run) {
    throw new Error('Invalid response from execution service');
  }

  return result;
};

export const getRuntimes = async (): Promise<PistonRuntime[]> => {
  const response = await fetch(`${PISTON_API}/runtimes`);
  return response.json();
};
