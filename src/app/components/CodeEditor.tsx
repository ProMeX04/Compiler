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
import { saveFileToIDB } from "@/app/utils/idb";
import { defaultMainEditorOptions } from "@/app/config/editor/monaco";
import WelcomeGuide from "@/app/components/Editor/WelcomeGuide";
import { PanelResizeHandle } from "react-resizable-panels";
import { MonacoEditor, InputOutputPanel } from "./Editor";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { FileExplorer } from "@/app/components/FileExplorer";
import { addDuplicateLineCommand } from "../config/editor/monaco";
import useTestingState from "@/app/hooks/useTestingState";
import ExerciseDisplay from "./Editor/ExerciseDisplay";

const MemoizedMonacoEditor = React.memo(MonacoEditor);
const MemoizedTestPanel = React.memo(TestPanel);
const MemoizedInputOutputPanel = React.memo(InputOutputPanel);

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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted;
}

export function CodeEditor({
  defaultContent = "",
  defaultFileName = "main",
  defaultLanguage = "python",
  initialTestCases = [{ input: "", expectedOutput: "" }],
  templateCodes = {},
  onSubmit,
}: CodeEditorProps) {
  const isMounted = useMounted();
  // Move useSearchParams inside useEffect to avoid hydration mismatch
  const [shareCode, setShareCode] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('shareCode');
    setShareCode(code);
  }, []);

  const {
    files,
    setFiles,
    activeFileId,
    activeFile,
    setActiveFileId,
    setRenamingFileId,
    handleLanguageChange,
    addFile,
    isSyncing,
    removeFile,
    uploadFile,
    saveAllFiles,
    pullAllFromCloud,
    updateFile,
    syncFileWithCloud,
    pullFileFromCloud,
    handleRenameFile,
    shareFile,
    accessSharedFile,
  } = useFileManager({
    defaultContent,
    defaultFileName,
    defaultLanguage,
    templateCodes,
  });

  useEffect(() => {
    const loadSharedFile = async () => {
      if (shareCode) {
        try {
          const file = await accessSharedFile(shareCode);
          if (!file) {
            console.error("File not found or not shared");
          }
        } catch (error) {
          console.error("Error loading shared file:", error);
        }
      }
    };

    loadSharedFile();
  }, [shareCode]);

  const { getLatestVersion } = usePistonRuntimes();
  const { 
    input, 
    output, 
    testCases, 
    setInput, 
    setOutput, 
    setTestCases, 
    handleTestCaseChange, 
    addTestCase, 
    removeTestCase 
  } = useTestingState(initialTestCases);
  const [, setCursorPosition] = useState<CursorPosition>({
    line: 1,
    column: 1,
  });
  const { currentTheme, theme } = useTheme();
  const [editorMode, setEditorMode] = useState<"code" | "test" | "editor" | "exercise">(
    "editor"
  );
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExerciseVisible, setIsExerciseVisible] = useState(false);

  const onToggleExercise = () => {
    setIsExerciseVisible((prev) => !prev);
  };

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
          input
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
    input,
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

  const saveActiveFileToCloud = useCallback(async () => {
    if (!activeFile) return;
    try {
      await syncFileWithCloud(activeFile.id);
    } catch{
    }
  }, [activeFile, syncFileWithCloud]);

  const downloadActiveFile = useCallback(() => {
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

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        await saveActiveFileToCloud();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopPropagation();
        await handleRunClick();
      }
    },
    [handleRunClick, saveActiveFileToCloud]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  useEffect(() => {
    if (activeFile) {
      setEditorMode("editor");
    }
  }, [activeFile]);

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRenameTab = (id: string) => {
    setRenamingFileId(id);
    handleCloseContextMenu();
  };

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
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
    },
    []
  );

  const handleTabContentChange = useCallback(
    async (fileId: string, newContent: string) => {
      if (!fileId) return;

      const updatedFiles = files.map((file) =>
        file.id === fileId
          ? { ...file, content: newContent, isSynced: false }
          : file
      );
      setFiles(updatedFiles);

      const updatedFile = updatedFiles.find((file) => file.id === fileId);
      if (updatedFile) {
        await saveFileToIDB(updatedFile);
      }
    },
    [files, setFiles]
  );

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
    await removeFile(id);
  };

  const handleFileSelect = (id: string) => {
    if (id === "") {
      setActiveFileId(null);
    } else {
      setActiveFileId(id);
    }
  };

  const editorPanel = useMemo(
    () => (
      <Panel
        id="editor-panel"
        order={2}
        defaultSize={editorMode === "editor" ? 80 : 60}
        minSize={20}
      >
        {activeFile ? (
          <MemoizedMonacoEditor
            key={activeFile.id}
            language={activeFile.language}
            value={activeFile.content}
            path={activeFile.name}
            onChange={(value) =>
              activeFileId && handleTabContentChange(activeFileId, value)
            }
            onMount={handleEditorMount}
            theme={currentTheme.name}
            options={defaultMainEditorOptions}
          />
        ) : (
          <WelcomeGuide />
        )}
      </Panel>
    ),
    [
      activeFile,
      activeFileId,
      editorMode,
      currentTheme.name,
      handleTabContentChange,
      handleEditorMount,
    ]
  );

  if (!isMounted) {
    return null;
  }

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
          onEditorModeChange={setEditorMode}
          onCompileAndRun={handleRunClick}
          onSubmit={onSubmit ? handleSubmit : undefined}
          onLanguageChange={handleLanguageChange}
          currentLanguage={activeFile?.language || defaultLanguage}
          isExplorerVisible={isExplorerVisible}
          toggleExplorer={() => setIsExplorerVisible(!isExplorerVisible)}
          rightElements={undefined}
          onToggleExercise={onToggleExercise}
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {isExplorerVisible && (
            <>
              <Panel
                id="explorer-panel"
                order={1}
                defaultSize={20}
                minSize={10}
              >
                <FileExplorer
                  files={files}
                  activeFile={activeFileId}
                  onSelectFile={handleFileSelect}
                  onRenameFile={handleRenameFile}
                  onDeleteFile={handleDeleteFile}
                  onAddFile={addFile}
                  isSyncing={isSyncing}
                  onUploadFile={uploadFile}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  saveAllFiles={saveAllFiles}
                  pullAllFromCloud={pullAllFromCloud}
                  updateFile={updateFile}
                  syncFileWithCloud={syncFileWithCloud}
                  pullFileFromCloud={pullFileFromCloud}
                  shareFile={shareFile}
                />
              </Panel>
              <PanelResizeHandle
                className={`w-[1px] h-full ${
                  theme === "light" ? "bg-gray-200" : "bg-zinc-800"
                }`}
              />
            </>
          )}
          
          {editorPanel}

          {/* Thay đổi phần này để xử lý exercise mode */}
          {(editorMode === "test" || editorMode === "code" || editorMode === "exercise") && (
            <>
              <PanelResizeHandle />
              <Panel id="output-panel" order={3} defaultSize={25} minSize={5}>
                {editorMode === "test" ? (
                  <MemoizedTestPanel
                    testCases={testCases}
                    onTestCaseChange={handleTestCaseChange}
                    onAddTestCase={addTestCase}
                    onRemoveTestCase={removeTestCase}
                  />
                ) : editorMode === "exercise" ? (
                  <ExerciseDisplay />
                ) : (
                  <MemoizedInputOutputPanel
                    currentTheme={currentTheme}
                    input={input}
                    output={output}
                    onInputChange={setInput}
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
          <button
            className={`w-full px-4 py-1.5 text-sm text-left ${
              theme === "light"
                ? "text-gray-800 hover:bg-gray-100"
                : "text-white hover:bg-zinc-700"
            }`}
            onClick={downloadActiveFile}
          >
            Download
          </button>
        </ContextMenu>
      )}
    </div>
  );
}
