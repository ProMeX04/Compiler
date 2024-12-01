import { useState, useCallback } from 'react';
import { TestCase } from '../types/types';

export interface TestingState {
  input: string;
  output: string;
  testCases: TestCase[];
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  setTestCases: (cases: TestCase[]) => void; 
  handleTestCaseChange: (index: number, field: keyof TestCase, value: string) => void;
  addTestCase: () => void;
  removeTestCase: (index: number) => void;
}

function useTestingState(initialTestCases: TestCase[] = [{ input: "", expectedOutput: "" }]): TestingState {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);

  const handleTestCaseChange = useCallback((
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  }, []);

  const addTestCase = useCallback(() => {
    setTestCases((prev) => [...prev, { input: "", expectedOutput: "" }]);
  }, []);

  const removeTestCase = useCallback((index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    input,
    output,
    testCases,
    setInput,
    setOutput,
    setTestCases, 
    handleTestCaseChange,
    addTestCase,
    removeTestCase,
  };
}

export default useTestingState;