"use client";
import React, { useEffect, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { EditorHeader } from "@/app/components/EditorHeader";
import { TestPanel } from "@/app/components/Editor/TestPanel";
import { ContextMenu } from "@/app/components/ContextMenu";
import { CursorPosition, TestCase } from "@/app/types/types";
import "@szhsin/react-menu/dist/index.css";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useFileManager } from "@/app/hooks/useFileManager";
import { useNewFileModal } from "@/app/hooks/useNewFileModal";
import { usePistonRuntimes } from "@/app/hooks/usePistonRuntimes";
import {
  MonacoEditor,
  NewFileModal,
  InputOutputPanel,
  ResizeHandle,
} from "./Editor";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { FileExplorer } from "@/app/components/FileExplorer";
import { addDuplicateLineCommand, addMoveLineCommands } from "./Editor/shortcuts";

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
}: // ...other props...
CodeEditorProps) {
  const {
    tabs,
    setTabs,
    activeTab,
    activeFile,
    setActiveTab,
    updateTabContent,
    updateTabName,
    handleLanguageChange,
    setRenamingTabId,
  } = useFileManager({
    defaultContent,
    defaultFileName,
    defaultLanguage,
    templateCodes,
  });

  const {
    isNewFileModalOpen,
    newFileName,
    newFileLanguage,
    setNewFileName,
    setNewFileLanguage,
    openNewFileModal: addNewFile,
    handleCreateNewFile,
    setIsNewFileModalOpen,
  } = useNewFileModal({
    defaultLanguage,
    templateCodes,
    onFileCreated: (newFile) => {
      setTabs((prev) => [...prev, newFile]);
      setActiveTab(newFile.id);
    },
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
    "code"
  );
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);

  const {
    isCompiling,
    setIsCompiling,
    executionTime,
    setExecutionTime,
    executeCodeWithMetrics,
    runTests
  } = useCodeExecution();

  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const compileAndRun = React.useCallback(async () => {
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
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setTestCases
  ]);

  const handleRunClick = React.useCallback(async () => {
    if (editorMode === "editor") {
      setEditorMode("code");
    }
    await compileAndRun();
  }, [editorMode, compileAndRun]);

  const saveActiveFile = () => {
    if (!activeFile) return;
    
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Existing Ctrl+B handler
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopPropagation();
        await compileAndRun();
      }
      
      // Add Ctrl+S handler
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        saveActiveFile();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [compileAndRun]); 

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopPropagation();
        await handleRunClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleRunClick]); 

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

    addDuplicateLineCommand(editor, monaco);
    addMoveLineCommands(editor, monaco);
  };

  const handleSubmit = async () => {
    if (!activeFile || !onSubmit) return;

    setIsCompiling(true);
    try {
      await onSubmit(activeFile.content, activeFile.language, testCases);
    } catch {
    } finally {
      setIsCompiling(false);
    }
  };

  const handleRenameFile = (id: string, newName: string) => {
    updateTabName(id, newName);
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e]'
      } ${currentTheme.text} overflow-hidden`}
    >
      <EditorHeader
        editorMode={editorMode}
        isCompiling={isCompiling}
        executionTime={executionTime}
        onAddFile={addNewFile}
        onEditorModeChange={setEditorMode}
        onCompileAndRun={handleRunClick}
        onSubmit={onSubmit ? handleSubmit : undefined}
        onLanguageChange={handleLanguageChange}
        currentLanguage={activeFile?.language || defaultLanguage}
        isExplorerVisible={isExplorerVisible}
        toggleExplorer={() => setIsExplorerVisible(!isExplorerVisible)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {isExplorerVisible && (
            <>
              <Panel id="explorer-panel" order={1} defaultSize={15} minSize={10}>
                <FileExplorer
                  files={tabs}
                  activeTab={activeTab}
                  onSelectFile={setActiveTab}
                  onContextMenu={handleContextMenu}
                  onRenameFile={handleRenameFile}
                />
              </Panel>
              <ResizeHandle className={`w-[1px] h-full ${theme === 'light' ? 'bg-gray-200' : 'bg-zinc-800'}`} />
            </>
          )}
          <Panel 
            id="editor-panel"
            order={2}
            defaultSize={editorMode === "editor" ? 100 : 80} 
            minSize={20}
          >
            <MonacoEditor
              language={activeFile?.language || "plaintext"}
              value={activeFile?.content || ""}
              path={activeFile?.name}
              onChange={(value) => updateTabContent(activeTab, value)}
              onMount={handleEditorDidMount}
              theme={currentTheme.name}
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
              <Panel 
                id="output-panel"
                order={3}
                defaultSize={20} 
                minSize={5}
              >
                {editorMode === "test" ? (
                  <TestPanel
                    testCases={testCases}
                    onTestCaseChange={handleTestCaseChange}
                    onAddTestCase={addTestCase}
                    onRemoveTestCase={removeTestCase}
                  />
                ) : (
                  <InputOutputPanel
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

      <NewFileModal
        isOpen={isNewFileModalOpen}
        theme={theme}
        currentTheme={currentTheme}
        fileName={newFileName}
        language={newFileLanguage}
        onFileNameChange={setNewFileName}
        onLanguageChange={setNewFileLanguage}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreate={handleCreateNewFile}
      />
    </div>
  );
}
