"use client";
import { CodeEditor } from "./components/CodeEditor";
export default function Page() {
  return (
    <CodeEditor defaultLanguage="python" defaultFileName="main"/>
  );
}
