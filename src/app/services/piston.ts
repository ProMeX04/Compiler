import { useQuery, useMutation } from '@tanstack/react-query';
import { PistonExecuteRequest, PistonExecuteResponse, PistonRuntime } from '../types/piston';

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Original functions as-is for direct API calls
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

// React Query hooks
export const useExecuteCode = () => {
  return useMutation({
    mutationFn: executeCode,
    onError: (error) => {
      console.error('Code execution failed:', error);
    }
  });
};

export const useRuntimes = () => {
  return useQuery({
    queryKey: ['runtimes'],
    queryFn: getRuntimes,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
};