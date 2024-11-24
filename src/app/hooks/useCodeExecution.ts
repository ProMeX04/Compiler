import { useState } from 'react';
import { executeCode } from '../services/piston';
import { TestCase } from '../types/types';

export function useCodeExecution() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executeCodeWithMetrics = async (
    language: string,
    version: string,
    content: string,
    stdin: string
  ) => {
    const startTime = performance.now();

    try {
      const result = await executeCode({
        language,
        version,
        files: [{ content }],
        stdin
      });

      if (!result || !result.run) {
        throw new Error('Invalid response from execution service');
      }

      const output = [
        result.run.stdout?.trim() || '',
        result.run.stderr?.trim() || '',
        result.run.code !== 0 ? `Exit code: ${result.run.code}` : null
      ].filter(Boolean).join('\n');

      return {
        output: output || 'No output',
        executionTime: Math.round(performance.now() - startTime)
      };
    } catch (err) {
      return {
        output: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        executionTime: Math.round(performance.now() - startTime)
      };
    }
  };

  const runTests = async (
    language: string,
    version: string,
    content: string,
    testCases: TestCase[]
  ): Promise<TestCase[]> => {
    setIsCompiling(true);
    try {
      const results = await Promise.all(
        testCases.map(async (testCase) => {
          const execResult = await executeCodeWithMetrics(
            language,
            version,
            content,
            testCase.input
          );
          return {
            ...testCase,
            actualOutput: execResult.output,
            passed: !execResult.output.includes('Error') && 
                    execResult.output.trim() === testCase.expectedOutput.trim()
          };
        })
      );
      return results;
    } finally {
      setIsCompiling(false);
    }
  };

  return {
    isCompiling,
    setIsCompiling,
    executionTime,
    setExecutionTime,
    executeCodeWithMetrics,
    runTests
  };
}