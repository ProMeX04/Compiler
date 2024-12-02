"use client";
import dynamic from 'next/dynamic';
import { Suspense } from "react";

// Dynamically import CodeEditor with disabled SSR
const CodeEditor = dynamic(
  () => import('./components/CodeEditor').then(mod => ({ default: mod.CodeEditor })),
  { ssr: false }
);

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e] text-white">
      <div>Loading...</div>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      <Suspense fallback={<LoadingFallback />}>
        <CodeEditor defaultLanguage="python" defaultFileName="main" />
      </Suspense>
    </main>
  );
}
