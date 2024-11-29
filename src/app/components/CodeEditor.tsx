"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { EditorHeader } from "@/app/components/EditorHeader";
import { TestPanel } from "@/app/components/Editor/TestPanel";
import { ContextMenu } from "@/app/components/ContextMenu";
import { CursorPosition, TestCase } from "@/app/types/types";
import "@szhsin/react-menu/dist/index.css";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useFileManager } from "@/app/hooks/useFileManager";
import { usePistonRuntimes } from "@/app/hooks/usePistonRuntimes";
import { saveFileToIDB } from '@/app/utils/idb'; // Add this import
import { getLanguageExtension } from '@/app/config/languageConfig'; // Add this import
import { defaultEditorOptions } from '@/app/config/editorConfig';

import {
  MonacoEditor,
  InputOutputPanel,
  ResizeHandle,
} from "./Editor";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { FileExplorer } from "@/app/components/FileExplorer";
import { addDuplicateLineCommand } from "./Editor/shortcuts";

const MemoizedMonacoEditor = React.memo(MonacoEditor);
const MemoizedTestPanel = React.memo(TestPanel);
const MemoizedInputOutputPanel = React.memo(InputOutputPanel);

const WelcomeGuide = () => {
  const { theme } = useTheme();
  return (
    <div className={`flex flex-col items-center justify-center h-full text-center p-4 ${
      theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
    }`}>
      <h2 className="text-2xl font-semibold mb-4">Welcome to Code Editor</h2>
      <div className="space-y-4 max-w-md">
        <p>To get started:</p>
        <ul className="space-y-2 text-left list-disc pl-5">
          <li>Click the <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">+ New File</kbd> button to create a new file</li>
          <li>Use <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl + S</kbd> to save your code</li>
          <li>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl + B</kbd> to run your code</li>
          <li>Switch between different views using the toolbar buttons</li>
        </ul>
      </div>
    </div>
  );
};

export interface CodeEditorProps {
  defaultContent?: string;
  defaultFileName?: string;
  defaultLanguage?: string;
  initialTestCases?: TestCase[];
  templateCodes?: Record<string, string>;
  onSubmit?: (
    content: string,
    language: string,
    testCases: TestCase[]
  ) => Promise<void>;
}

export function CodeEditor({
  defaultContent = "",
  defaultFileName = "main",
  defaultLanguage = "python",
  initialTestCases = [{ input: "", expectedOutput: "" }],
  templateCodes = {},
  onSubmit,
}: CodeEditorProps) {
  const {
    tabs,
    setTabs,
    activeTab,
    activeFile,
    setActiveTab,
    setRenamingTabId,
    handleLanguageChange,
    addFile,
    isSyncing,
    lastSyncTime,
    syncWithCloud,
    pullFromCloud,
    removeTab, 
  } = useFileManager({
    defaultContent,
    defaultFileName,
    defaultLanguage,
    templateCodes,
  });

  const { getLatestVersion } = usePistonRuntimes();
  const [testCase, setTestCase] = useState("");
  const [output, setOutput] = useState("");
  const [, setCursorPosition] = useState<CursorPosition>({
    line: 1,
    column: 1,
  });
  const { currentTheme, theme } = useTheme();
  const [editorMode, setEditorMode] = useState<"code" | "test" | "editor">(
    "editor"
  );
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);

  const {
    isCompiling,
    setIsCompiling,
    executionTime,
    setExecutionTime,
    executeCodeWithMetrics,
    runTests,
  } = useCodeExecution();

  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const compileAndRun = useCallback(async () => {
    if (!activeFile) return;

    const version = getLatestVersion(activeFile.language);
    if (!version) {
      setOutput(`Error: No runtime version found for ${activeFile.language}`);
      return;
    }

    setExecutionTime(null);
    setIsCompiling(true);

    try {
      if (editorMode === "test") {
        const updatedTestCases = await runTests(
          activeFile.language,
          version,
          activeFile.content,
          testCases
        );
        setTestCases(updatedTestCases);
      } else {
        const result = await executeCodeWithMetrics(
          activeFile.language,
          version,
          activeFile.content,
          testCase
        );
        setOutput(result.output);
        setExecutionTime(result.executionTime);
      }
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsCompiling(false);
    }
  }, [
    activeFile,
    editorMode,
    testCase,
    testCases,
    getLatestVersion,
    runTests,
    executeCodeWithMetrics,
    setOutput,
    setExecutionTime,
    setIsCompiling,
    setTestCases,
  ]);

  const handleRunClick = useCallback(async () => {
    if (editorMode === "editor") {
      setEditorMode("code");
    }
    await compileAndRun();
  }, [editorMode, compileAndRun]);

  const saveActiveFile = useCallback(() => {
    if (!activeFile) return;
  
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeFile]);
  
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        saveActiveFile();
        return;
      }
  
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopPropagation();
        await handleRunClick();
      }
    };
  
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleRunClick, saveActiveFile]);

  useEffect(() => {
    if (activeFile) {
      setEditorMode("editor");
    }
  }, [activeFile]);

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

  const handleEditorMount = useCallback((
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

    addDuplicateLineCommand(editor, monaco);
  }, []);

  const handleTabContentChange = useCallback(async (fileId: string, newContent: string) => {
    if (!fileId) return; // Add null check
    
    const updatedTabs = tabs.map(file => 
      file.id === fileId ? { ...file, content: newContent } : file
    );
    setTabs(updatedTabs);
    
    const updatedFile = updatedTabs.find(file => file.id === fileId);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
  }, [tabs, setTabs]);

  const handleRenameFile = async (id: string, newName: string) => {
    const updatedTabs = tabs.map(tab => {
      if (tab.id === id) {
        const nameWithoutExt = newName.split(".")[0];
        const extension = getLanguageExtension(tab.language);
        return { ...tab, name: `${nameWithoutExt}.${extension}` };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
    const updatedFile = updatedTabs.find(tab => tab.id === id);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
    
    setRenamingTabId(null);
  };

  const handleSubmit = async () => {
    if (!activeFile || !onSubmit) return;

    setIsCompiling(true);
    try {
      await onSubmit(activeFile.content, activeFile.language, testCases);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    await removeTab(id);
  };

  const editorPanel = useMemo(() => (
    <Panel
      id="editor-panel"
      order={2}
      defaultSize={editorMode === "editor" ? 85 : 60}
      minSize={20}
    >
      {activeFile ? (
        <MemoizedMonacoEditor
          language={activeFile.language}
          value={activeFile.content}
          path={activeFile.name}
          onChange={(value) => activeTab && handleTabContentChange(activeTab, value)} // Add null check here
          onMount={handleEditorMount}
          theme={currentTheme.name}
          options={defaultEditorOptions}
        />
      ) : (
        <WelcomeGuide />
      )}
    </Panel>
  ), [activeFile, activeTab, editorMode, currentTheme.name, handleTabContentChange, handleEditorMount]);

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
      } ${currentTheme.text} overflow-hidden`}
    >
      <div className="relative z-40">
        <EditorHeader
          editorMode={editorMode}
          isCompiling={isCompiling}
          executionTime={executionTime}
          onAddFile={addFile}
          onEditorModeChange={setEditorMode}
          onCompileAndRun={handleRunClick}
          onSubmit={onSubmit ? handleSubmit : undefined}
          onLanguageChange={handleLanguageChange}
          currentLanguage={activeFile?.language || defaultLanguage}
          isExplorerVisible={isExplorerVisible}
          toggleExplorer={() => setIsExplorerVisible(!isExplorerVisible)}
          pullFromCloud={pullFromCloud}
          isSyncing={isSyncing}
          syncWithCloud={syncWithCloud}
          lastSyncTime={lastSyncTime}
          rightElements={undefined}
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {isExplorerVisible && (
            <>
              <Panel
                id="explorer-panel"
                order={1}
                defaultSize={15}
                minSize={10}
              >
                <FileExplorer
                  files={tabs}
                  activeTab={activeTab}
                  onSelectFile={setActiveTab}
                  onContextMenu={handleContextMenu}
                  onRenameFile={handleRenameFile}
                  onDeleteFile={handleDeleteFile}
                />
              </Panel>
              <ResizeHandle
                className={`w-[1px] h-full ${
                  theme === "light" ? "bg-gray-200" : "bg-zinc-800"
                }`}
              />
            </>
          )}
          {editorPanel}
          {editorMode !== "editor" && (
            <>
              <ResizeHandle />
              <Panel id="output-panel" order={3} defaultSize={25} minSize={5}>
                {editorMode === "test" ? (
                  <MemoizedTestPanel
                    testCases={testCases}
                    onTestCaseChange={handleTestCaseChange}
                    onAddTestCase={addTestCase}
                    onRemoveTestCase={removeTestCase}
                  />
                ) : (
                  <MemoizedInputOutputPanel
                    currentTheme={currentTheme}
                    testCase={testCase}
                    output={output}
                    onTestCaseChange={setTestCase}
                    onOutputChange={setOutput}
                  />
                )}
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

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
