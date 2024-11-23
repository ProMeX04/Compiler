"use client";
import { CodeEditor } from "./components/CodeEditor";
export default function Main() {
  return (
    <CodeEditor
      defaultContent="Xin chao"
      defaultLanguage="py"
      defaultFileName="main" // Removed .py extension
      initialTestCases={[
        { input: "1", expectedOutput: "1" },
        { input: "1", expectedOutput: "1" },
      ]}
    />
  );
}
