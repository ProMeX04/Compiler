import { useTheme } from "@/app/contexts/ThemeContext";
import { TestCase } from "@/app/types/types";
import { FaPlus, FaTimes, FaCheck, FaTimes as FaFail } from "react-icons/fa";

interface TestPanelProps {
  testCases: TestCase[];
  onTestCaseChange: (
    index: number,
    field: keyof TestCase,
    value: string
  ) => void;
  onAddTestCase: () => void;
  onRemoveTestCase: (index: number) => void;
  // Add any additional props needed for parameterization
}

const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const textarea = e.target;
  textarea.style.height = '0';
  const scrollHeight = textarea.scrollHeight;
  textarea.style.height = `${scrollHeight}px`;
};

export function TestPanel({
  testCases,
  onTestCaseChange,
  onAddTestCase,
  onRemoveTestCase,
}: TestPanelProps) {
  const { theme } = useTheme();

  const getStatusColors = (passed: boolean | undefined) => {
    if (passed === undefined) return "";
    return passed
      ? "border-l-4 border-l-green-500"
      : "border-l-4 border-l-red-500";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-medium">Test Cases</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">
            {testCases.filter(tc => tc.passed).length}/{testCases.length} Passed
          </span>
          <button
            onClick={onAddTestCase}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <FaPlus size={10} />
            Add Test
          </button>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          {testCases.map((testCase, index) => (
            <div
              key={index}
              className={`group relative rounded-lg border ${
                theme === "light"
                  ? "border-gray-200 bg-white"
                  : "border-zinc-700 bg-zinc-800/50"
              } ${getStatusColors(testCase.passed)} transition-all duration-200`}
            >
              {/* Test Case Header */}
              <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Test #{index + 1}</span>
                  {testCase.passed !== undefined && (
                    <span className={`flex items-center text-xs ${
                      testCase.passed ? "text-green-500" : "text-red-500"
                    }`}>
                      {testCase.passed ? (
                        <FaCheck className="mr-1" size={10} />
                      ) : (
                        <FaFail className="mr-1" size={10} />
                      )}
                      {testCase.passed ? "Passed" : "Failed"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveTestCase(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                >
                  <FaTimes size={12} />
                </button>
              </div>

              {/* Test Case Content */}
              <div className="p-2 space-y-2">
                <div>
                  <label className="block text-xs mb-1 opacity-70">Input:</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => {
                      onTestCaseChange(index, "input", e.target.value);
                      autoResize(e);
                    }}
                    onFocus={e => autoResize(e)}
                    className={`w-full rounded-md text-xs p-2 resize-none transition-colors overflow-hidden font-mono ${
                      theme === "light"
                        ? "bg-gray-50 border border-gray-200"
                        : "bg-zinc-900 border border-zinc-700"
                    }`}
                    style={{ minHeight: "32px" }}
                    rows={1}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 opacity-70">Expected:</label>
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => {
                      onTestCaseChange(index, "expectedOutput", e.target.value);
                      autoResize(e);
                    }}
                    onFocus={e => autoResize(e)}
                    className={`w-full rounded-md text-xs p-2 resize-none transition-colors overflow-hidden font-mono ${
                      theme === "light"
                        ? "bg-gray-50 border border-gray-200"
                        : "bg-zinc-900 border border-zinc-700"
                    }`}
                    style={{ minHeight: "32px" }}
                    rows={1}
                  />
                </div>
                {testCase.actualOutput !== undefined && (
                  <div>
                    <label className="block text-xs mb-1 opacity-70">Actual:</label>
                    <div className={`w-full rounded-md text-xs p-2 font-mono whitespace-pre-wrap ${
                      theme === "light"
                        ? "bg-gray-100"
                        : "bg-zinc-900"
                    }`}>
                      {testCase.actualOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
