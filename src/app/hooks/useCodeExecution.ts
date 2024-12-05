import { useState } from 'react';
import { executeCode } from '../services/piston';
import { TestCase } from '../types/types';
export function useCodeExecution() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const executeCodeWithMetrics = async (
    content: string,
    stdin: string,
    language: string,
    version: string
  ) => {
    setIsRunningCode(true);
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Code execution error:', errorMessage);
      return {
        output: `Error: ${errorMessage}`,
        executionTime: Math.round(performance.now() - startTime)
      };
    } finally {
      setTimeout(() => setIsRunningCode(false), 1);
    }
  };

  const runTests = async (
    language: string,
    version: string,
    content: string,
    testCases: TestCase[],
    onTestComplete?: (updatedTestCases: TestCase[]) => void
  ): Promise<TestCase[]> => {
    setIsCompiling(true);
    const results: TestCase[] = [...testCases];

    try {
      for (let i = 0; i < testCases.length; i++) {
        const { output } = await executeCodeWithMetrics(
          content,
          testCases[i].input,
          language,
          version
        );

        results[i] = {
          ...testCases[i],
          actualOutput: output,
          passed: !output.includes('Error') && 
                  output.trim() === testCases[i].expectedOutput.trim()
        };

        // Update progress after each test
        if (onTestComplete) {
          onTestComplete([...results]);
        }
      }

      return results;
    } catch (error) {
      console.error('Test execution error:', error);
      return testCases.map(test => ({
        ...test,
        actualOutput: 'Error executing test',
        passed: false
      }));
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
    runTests,
    isRunningCode
  };
}