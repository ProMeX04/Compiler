import { useTheme } from "@/app/contexts/ThemeContext";
import { TestCase } from "@/app/types/types";

interface TestPanelProps {
  testCases: TestCase[];
  onTestCaseChange: (
    index: number,
    field: keyof TestCase,
    value: string
  ) => void;
  onAddTestCase: () => void;
  onRemoveTestCase: (index: number) => void;
}

const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  e.target.style.height = "auto";
  e.target.style.height = `${e.target.scrollHeight}px`;
};

export function TestPanel({
  testCases,
  onTestCaseChange,
  onAddTestCase,
  onRemoveTestCase,
}: TestPanelProps) {
  const { theme } = useTheme();

  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex flex-col gap-4">
        <div
          className={`p-2 rounded ${
            testCases.some((tc) => tc.passed !== undefined)
              ? theme === "light"
                ? "bg-gray-100 border border-gray-200"
                : "bg-zinc-800/50 border border-zinc-700"
              : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Test Cases</h3>
            <div className="flex items-center gap-4">
              {testCases.some((tc) => tc.passed !== undefined) && (
                <span className="text-xs opacity-75">
                  Passed: {testCases.filter((tc) => tc.passed).length}/
                  {testCases.length}
                </span>
              )}
              <button
                onClick={onAddTestCase}
                className={`text-xs px-2 py-1 rounded border ${
                  theme === "light"
                    ? "border-gray-300 hover:bg-gray-100"
                    : "border-zinc-600 hover:bg-zinc-700"
                } transition-colors`}
              >
                Add Test Case
              </button>
            </div>
          </div>
        </div>

        {/* Test cases list */}
        <div className="space-y-4">
          {testCases.map((tc, index) => (
            <div
              key={index}
              className={`mb-4 p-3 border rounded transition-colors ${
                tc.passed === undefined
                  ? theme === "light"
                    ? "border-gray-300 bg-gray-50"
                    : "border-zinc-700 bg-zinc-900"
                  : tc.passed
                  ? theme === "light"
                    ? "border-green-500/30 bg-green-50"
                    : "border-green-500/30 bg-green-950"
                  : theme === "light"
                  ? "border-red-500/30 bg-red-50"
                  : "border-red-500/30 bg-red-950"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    Test Case #{index + 1}
                  </span>
                  {tc.passed !== undefined && (
                    <span
                      className={`text-xs ${
                        tc.passed ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tc.passed ? "✓ Passed" : "✗ Failed"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveTestCase(index)}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs mb-1 opacity-70">
                    Input:
                  </label>
                  <textarea
                    value={tc.input}
                    onChange={(e) => {
                      onTestCaseChange(index, "input", e.target.value);
                      autoResize(e);
                    }}
                    onFocus={(e) => autoResize(e)}
                    className={`w-full min-h-[32px] max-h-[200px] rounded p-2 text-xs overflow-y-hidden resize-none ${
                      theme === "light"
                        ? "bg-white border border-gray-200"
                        : "bg-zinc-800/80 border border-zinc-700"
                    }`}
                    style={{ height: "auto" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 opacity-70">
                    Expected Output:
                  </label>
                  <textarea
                    value={tc.expectedOutput}
                    onChange={(e) => {
                      onTestCaseChange(index, "expectedOutput", e.target.value);
                      autoResize(e);
                    }}
                    onFocus={(e) => autoResize(e)}
                    className={`w-full min-h-[32px] max-h-[200px] rounded p-2 text-xs overflow-y-hidden resize-none ${
                      theme === "light"
                        ? "bg-white border border-gray-200"
                        : "bg-zinc-800/80 border border-zinc-700"
                    }`}
                    style={{ height: "auto" }}
                  />
                </div>
                {tc.actualOutput !== undefined && (
                  <div>
                    <label className="block text-xs mb-1 opacity-70">
                      Actual Output:
                    </label>
                    <textarea
                      value={tc.actualOutput}
                      readOnly
                      className={`w-full min-h-[32px] max-h-[200px] rounded p-2 text-xs overflow-y-auto resize-none ${
                        theme === "light"
                          ? "bg-gray-100 border border-gray-200"
                          : "bg-zinc-800/50 border border-zinc-700"
                      }`}
                      style={{ height: "auto" }}
                    />
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
