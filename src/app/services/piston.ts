import { PistonExecuteRequest, PistonExecuteResponse, PistonRuntime } from '../types/piston';

const PISTON_API = 'https://emkc.org/api/v2/piston';

export const executeCode = async (params: PistonExecuteRequest): Promise<PistonExecuteResponse> => {
  const response = await fetch(`${PISTON_API}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: params.language,
      version: params.version,
      files: [
        {
          name: 'main',
          content: params.files[0].content,
        }
      ],
      stdin: params.stdin,
      // Add these optional parameters
      args: [],
      compile_timeout: 10000,
      run_timeout: 10000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Execution failed: ${errorData}`);
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
