"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
import { executeCode } from "@/app/services/piston";
import {
  LANGUAGE_CONFIGS,
  getLanguageExtension,
} from "@/app/config/languageConfig";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface TemplateCode {
  [language: string]: string;
}

interface CodeEditorProps {
  defaultContent?: string;
  defaultFileName?: string;
  defaultLanguage?: string;
  initialTestCases?: TestCase[];

  onSubmit?: (
    code: string,
    language: string,
    testCases: TestCase[]
  ) => Promise<void>;
  templateCodes?: TemplateCode;
}

export function CodeEditor({
  defaultContent = "",
  defaultFileName = "main",
  defaultLanguage = "python",
  initialTestCases = [{ input: "", expectedOutput: "" }],
  templateCodes = {},
  onSubmit,
}: CodeEditorProps) {
  const getExtensionFromLanguage = (language: string): string => {
    return getLanguageExtension(language);
  };

  const [tabs, setTabs] = useState<FileTabType[]>([
    {
      id: "1",
      name: `${defaultFileName}.${getExtensionFromLanguage(defaultLanguage)}`,
      content:
        defaultContent ||
        templateCodes[defaultLanguage] ||
        LANGUAGE_CONFIGS[defaultLanguage]?.defaultContent ||
        "",
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
  const [editorMode, setEditorMode] = useState<"code" | "test" | "editor">(
    "code"
  );
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);

  // Thêm state cho modal tạo file mới
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("Main");
  // Thêm state cho language mới
  const [newFileLanguage, setNewFileLanguage] = useState(defaultLanguage);

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
    setNewFileLanguage(defaultLanguage); // Reset về ngôn ngữ mặc định
    setIsNewFileModalOpen(true);
  };

  const handleCreateNewFile = () => {
    const newId = String(Date.now());
    const extension = getExtensionFromLanguage(newFileLanguage);
    const templateCode =
      templateCodes[newFileLanguage] ||
      LANGUAGE_CONFIGS[newFileLanguage]?.defaultContent ||
      "";

    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: `${newFileName}.${extension}`,
        content: templateCode,
        language: newFileLanguage,
      },
    ]);
    setActiveTab(newId);
    setIsNewFileModalOpen(false);
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
      if (!LANGUAGE_CONFIGS[activeFile.language]) {
        throw new Error(`Language ${activeFile.language} not supported`);
      }

      // Handle each mode separately
      if (editorMode === "test") {
        const updatedTestCases = [...testCases];
        for (let i = 0; i < testCases.length; i++) {
          const result = await executeCode({
            language: activeFile.language,
            version: "latest",
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
      } else if (editorMode === "code") {
        const result = await executeCode({
          language: activeFile.language,
          version: "latest",
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
    if (!LANGUAGE_CONFIGS[newLanguage]) return;

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTab) {
          const nameWithoutExt = tab.name.split(".")[0];
          const extension = getExtensionFromLanguage(newLanguage);
          const shouldUseTemplate = !tab.content || tab.content.trim() === "";

          const templateCode = shouldUseTemplate
            ? templateCodes[newLanguage] ||
              LANGUAGE_CONFIGS[newLanguage]?.defaultContent ||
              ""
            : tab.content;

          return {
            ...tab,
            language: newLanguage,
            name: `${nameWithoutExt}.${extension}`,
            content: templateCode,
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

      {/* New File Modal */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${currentTheme.bg} rounded-lg p-4 min-w-[300px]`}>
            <div className="mb-4">
              <label className="block text-xs mb-2 opacity-70">
                File Name:
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className={`w-full p-2 text-sm rounded border ${
                  theme === "light"
                    ? "border-gray-300 bg-white"
                    : "border-zinc-700 bg-zinc-800"
                }`}
                placeholder="Enter file name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNewFile();
                  if (e.key === "Escape") setIsNewFileModalOpen(false);
                }}
              />
            </div>

            {/* Language Selector */}
            <div className="mb-4">
              <label className="block text-xs mb-2 opacity-70">Language:</label>
              <select
                value={newFileLanguage}
                onChange={(e) => setNewFileLanguage(e.target.value)}
                className={`w-full p-2 text-sm rounded border ${
                  theme === "light"
                    ? "border-gray-300 bg-white"
                    : "border-zinc-700 bg-zinc-800"
                }`}
              >
                {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
                  <option key={lang} value={lang}>
                    {config.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsNewFileModalOpen(false)}
                className={`px-3 py-1.5 text-xs rounded ${
                  theme === "light" ? "hover:bg-gray-100" : "hover:bg-zinc-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
