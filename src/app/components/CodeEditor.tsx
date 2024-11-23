"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { EditorHeader } from "@/app/components/EditorHeader";
import { TestPanel } from "@/app/components/TestPanel";
import { ContextMenu } from "@/app/components/ContextMenu";
import {
  FileTab as FileTabType,
  CursorPosition,
  TestCase,
} from "@/app/types/types";
import "@szhsin/react-menu/dist/index.css";
import "../styles/resizable.css";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTheme } from "@/app/contexts/ThemeContext";
import { defaultLanguages } from "@/app/config/editor";
import { PistonRuntime } from "@/app/types/piston";
import { getRuntimes, executeCode } from "@/app/services/piston";
import { getLanguageExtension } from "@/app/config/languageConfig";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const LANGUAGE_TO_EXTENSION: { [key: string]: string } = {
  "c++": "cpp", // C++
  cpp: "cpp", // C++ (alternative name)
  c: "c", // C
  python: "py", // Python
  javascript: "js", // JavaScript
  typescript: "ts", // TypeScript
  java: "java", // Java
  csharp: "cs", // C#
  php: "php", // PHP
  ruby: "rb", // Ruby
  go: "go", // Go
  rust: "rs", // Rust
  kotlin: "kt", // Kotlin
  swift: "swift", // Swift
  scala: "scala", // Scala
  perl: "pl", // Perl
};

interface CodeEditorProps {
  // Initial content
  defaultContent?: string;
  defaultFileName?: string; // Now this should be without extension
  defaultLanguage?: string;

  // Test cases
  initialTestCases?: TestCase[];

  // Submission handling
  onSubmit?: (
    code: string,
    language: string,
    testCases: TestCase[]
  ) => Promise<void>;
  // Optional callbacks
}

export function CodeEditor({
  defaultContent = "",
  defaultFileName = "main",
  defaultLanguage = "python",
  initialTestCases = [{ input: "", expectedOutput: "" }],
  onSubmit,
}: CodeEditorProps) {
  // Get extension helper
  const getExtensionFromLanguage = (language: string): string => {
    // Use language config helper
    return getLanguageExtension(language);
  };

  const [tabs, setTabs] = useState<FileTabType[]>([
    {
      id: "1",
      name: `${defaultFileName}.${getExtensionFromLanguage(defaultLanguage)}`,
      content: defaultContent,
      language: defaultLanguage,
    },
  ]);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [testCase, setTestCase] = useState("");
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [, setCursorPosition] = useState<CursorPosition>({
    line: 1,
    column: 1,
  });
  const { currentTheme, theme } = useTheme();
  const [runtimes, setRuntimes] = useState<PistonRuntime[]>([]);
  const [editorMode, setEditorMode] = useState<"code" | "test" | "editor">(
    "code"
  );
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [supportedLanguages, setSupportedLanguages] = useState<{
    [key: string]: PistonRuntime;
  }>({
    // Default state while loading
    [defaultLanguage]: {
      language: defaultLanguage,
      version: "latest",
      aliases: [],
    },
  });

  useEffect(() => {
    getRuntimes()
      .then((runtimes) => {
        const latestVersions: { [key: string]: PistonRuntime } = {};

        runtimes.forEach((runtime) => {
          // Special handling for C++
          const language =
            runtime.language === "c++" ? "cpp" : runtime.language;
          // Make display name more user-friendly
          const displayName =
            language === "cpp"
              ? "C++"
              : language.charAt(0).toUpperCase() + language.slice(1);

          const runtimeWithDisplay = {
            ...runtime,
            language,
            display_name: displayName,
          };

          // Check if this is a newer version
          const currentVersion = latestVersions[language]?.version || "0";
          if (!latestVersions[language] || runtime.version > currentVersion) {
            latestVersions[language] = runtimeWithDisplay;
          }
        });

        // Filter and set supported languages
        const filteredLanguages = Object.entries(latestVersions)
          .filter(([lang]) => LANGUAGE_TO_EXTENSION[lang])
          .reduce((acc, [lang, runtime]) => {
            acc[lang] = runtime;
            return acc;
          }, {} as { [key: string]: PistonRuntime });

        setSupportedLanguages(filteredLanguages);
        setRuntimes(runtimes);
      })
      .catch((error) => {
        console.error("Failed to load runtimes:", error);
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        compileAndRun();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTab, testCase]);

  const addNewFile = () => {
    const newId = String(Date.now());
    const defaultLang = defaultLanguages.python;
    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: `untitled.${getExtensionFromLanguage(defaultLang.name)}`,
        content: defaultLang.defaultContent,
        language: defaultLang.name,
      },
    ]);
    setActiveTab(newId);
  };

  const updateTabName = (id: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === id) {
          const nameWithoutExt = newName.split(".")[0];
          const extension = getExtensionFromLanguage(tab.language);
          return {
            ...tab,
            name: `${nameWithoutExt}.${extension}`,
          };
        }
        return tab;
      })
    );
  };

  const updateTabContent = (id: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, content: newContent } : tab))
    );
  };

  const removeTab = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs[0]?.id || "");
    }
  };

  const handleContextMenu = (event: React.MouseEvent, id: string) => {
    event.preventDefault();
    setContextMenu({ id, x: event.clientX, y: event.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRenameTab = (id: string) => {
    setRenamingTabId(id);
    handleCloseContextMenu();
  };

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  };

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const compileAndRun = async () => {
    if (!activeFile) return;

    setIsCompiling(true);
    setOutput("");
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const runtime = runtimes.find(
        (r) =>
          r.language === activeFile.language ||
          r.aliases.includes(activeFile.language)
      );

      if (!runtime) {
        throw new Error(`Language ${activeFile.language} not supported`);
      }

      // Handle each mode separately
      if (editorMode === "test") {
        const updatedTestCases = [...testCases];
        for (let i = 0; i < testCases.length; i++) {
          const result = await executeCode({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: activeFile.content }],
            stdin: testCases[i].input,
          });

          const testOutput = result.run.stdout.trim();
          const passed = testOutput === testCases[i].expectedOutput.trim();

          updatedTestCases[i] = {
            ...testCases[i],
            actualOutput: testOutput,
            passed,
          };
        }
        setTestCases(updatedTestCases);
        // Don't set output in test mode
      } 
      else if (editorMode === "code") {
        // Normal run mode - only execute with input from testCase panel
        const result = await executeCode({
          language: runtime.language,
          version: runtime.version,
          files: [{ content: activeFile.content }],
          stdin: testCase,
        });

        const output = [
          result.run.stdout,
          result.run.stderr,
          result.run.code !== 0 ? `Exit code: ${result.run.code}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        setOutput(output || "No output");
      }

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error("Execution error:", error);
      setOutput(
        `System Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCompiling(false);
    }
  };

  const ResizeHandle = ({ className = "" }) => (
    <PanelResizeHandle
      className={`hover:bg-zinc-700 active:bg-zinc-600 transition-colors ${className}`}
    />
  );

  const handleEditorDidMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    editor.onDidChangeCursorPosition(
      (e: Monaco.editor.ICursorPositionChangedEvent) => {
        const position = e.position;
        setCursorPosition({
          line: position.lineNumber,
          column: position.column,
        });
      }
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
      () => {
        const selection = editor.getSelection();
        const model = editor.getModel();

        if (selection && model) {
          if (selection.isEmpty()) {
            const lineNumber = selection.startLineNumber;
            const lineContent = model.getLineContent(lineNumber);
            editor.executeEdits("", [
              {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                text: lineContent + "\n",
              },
            ]);
            editor.setPosition({
              lineNumber: lineNumber + 1,
              column: selection.startColumn,
            });
          } else {
            const selectedText = model.getValueInRange(selection);
            editor.executeEdits("", [
              {
                range: new monaco.Range(
                  selection.endLineNumber,
                  selection.endColumn,
                  selection.endLineNumber,
                  selection.endColumn
                ),
                text: selectedText,
              },
            ]);
          }
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!activeFile || !onSubmit) return;

    setIsCompiling(true);
    try {
      await onSubmit(activeFile.content, activeFile.language, testCases);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    const runtime = supportedLanguages[newLanguage];
    if (!runtime) return;

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTab) {
          const nameWithoutExt = tab.name.split(".")[0];
          const extension = getExtensionFromLanguage(newLanguage);
          return {
            ...tab,
            language: newLanguage,
            name: `${nameWithoutExt}.${extension}`,
          };
        }
        return tab;
      })
    );
  };

  const activeFile = tabs.find((tab) => tab.id === activeTab);

  return (
    <div
      className={`flex flex-col h-screen ${currentTheme.bg} ${currentTheme.text} overflow-hidden`}
    >
      <EditorHeader
        tabs={tabs}
        activeTab={activeTab}
        editorMode={editorMode}
        isCompiling={isCompiling}
        executionTime={executionTime}
        onAddFile={addNewFile}
        onSelectTab={setActiveTab}
        onRemoveTab={removeTab}
        onContextMenu={handleContextMenu}
        onRenameTab={updateTabName}
        onEditorModeChange={setEditorMode}
        onCompileAndRun={compileAndRun}
        renamingTabId={renamingTabId}
        onRenameComplete={() => setRenamingTabId(null)}
        onSubmit={onSubmit ? handleSubmit : undefined}
        onLanguageChange={handleLanguageChange}
        currentLanguage={activeFile?.language || defaultLanguage}
        supportedLanguages={supportedLanguages}
      />

      <PanelGroup direction="horizontal" className="flex-1 overflow-auto">
        <Panel defaultSize={editorMode === "editor" ? 100 : 50} minSize={20}>
          <MonacoEditor
            height="100%"
            language={activeFile?.language || "plaintext"}
            value={activeFile?.content || ""}
            path={activeFile?.name}
            onChange={(value) => updateTabContent(activeTab, value || "")}
            onMount={handleEditorDidMount}
            theme={currentTheme.name} // Sử dụng theme từ context
            options={{
              fontFamily: "Cascadia Mono",
              fontSize: 14,
              lineHeight: 24,
              suggestOnTriggerCharacters: true,
              quickSuggestions: { other: true, comments: true, strings: true },
              snippetSuggestions: "inline",
              acceptSuggestionOnEnter: "on",
              tabCompletion: "on",
              wordBasedSuggestions: "allDocuments",
              smoothScrolling: true, // Add smooth scrolling
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                verticalSliderSize: 8,
                horizontalSliderSize: 8,
              },
              suggest: {
                localityBonus: true,
                snippetsPreventQuickSuggestions: false,
                showIcons: true,
                showStatusBar: true,
                preview: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showDeprecated: false,
                matchOnWordStartOnly: false,
              },
              minimap: { enabled: false },
            }}
          />
        </Panel>
        {editorMode !== "editor" && (
          <>
            <ResizeHandle />
            <Panel defaultSize={50} minSize={20}>
              {editorMode === "test" ? (
                <TestPanel
                  testCases={testCases}
                  onTestCaseChange={handleTestCaseChange}
                  onAddTestCase={addTestCase}
                  onRemoveTestCase={removeTestCase}
                />
              ) : (
                <PanelGroup
                  direction="vertical"
                  className="h-full overflow-auto"
                >
                  <Panel defaultSize={40} minSize={5}>
                    <div className={`h-full ${currentTheme.panelBg}`}>
                      <MonacoEditor
                        height="100%"
                        language="plaintext"
                        value={testCase}
                        onChange={(value) => setTestCase(value || "")}
                        theme={currentTheme.name}
                        options={{
                          fontFamily: "Cascadia Mono",
                          fontSize: 14,
                          lineHeight: 24,
                          minimap: { enabled: false },
                          smoothScrolling: true, // Add smooth scrolling
                          scrollBeyondLastLine: false,
                          // Remove readOnly option or set it to false
                          scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                            useShadows: false,
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                            verticalSliderSize: 8,
                            horizontalSliderSize: 8,
                          },
                        }}
                      />
                    </div>
                  </Panel>
                  <ResizeHandle className="h-[2px]" />
                  <Panel defaultSize={60} minSize={5}>
                    <div className={`h-full ${currentTheme.panelBg}`}>
                      <MonacoEditor
                        height="100%"
                        language="plaintext"
                        value={output}
                        onChange={(value) => setOutput(value || "")}
                        theme={currentTheme.name}
                        options={{
                          fontFamily: "Cascadia Mono",
                          fontSize: 14,
                          lineHeight: 24,
                          minimap: { enabled: false },
                          readOnly: false,
                          smoothScrolling: true, // Add smooth scrolling
                          scrollBeyondLastLine: false,
                          scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                            useShadows: false,
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                            verticalSliderSize: 8,
                            horizontalSliderSize: 8,
                          },
                        }}
                      />
                    </div>
                  </Panel>
                </PanelGroup>
              )}
            </Panel>
          </>
        )}
      </PanelGroup>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
        >
          <button
            className={`w-full px-4 py-1.5 text-sm text-left ${
              theme === "light"
                ? "text-gray-800 hover:bg-gray-100"
                : "text-white hover:bg-zinc-700"
            }`}
            onClick={() => handleRenameTab(contextMenu.id)}
          >
            Rename
          </button>
        </ContextMenu>
      )}
    </div>
  );
}
