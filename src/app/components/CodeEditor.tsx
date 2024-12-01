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
import { getLanguageExtension } from "@/app/config/languagesConfig/categories";
import { defaultMainEditorOptions } from "@/app/config/editor/monaco";
import WelcomeGuide from "@/app/components/Editor/WelcomeGuide";
import { PanelResizeHandle } from "react-resizable-panels";
import { MonacoEditor, InputOutputPanel } from "./Editor";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { FileExplorer } from "@/app/components/FileExplorer";
import { addDuplicateLineCommand } from "../config/editor/shortcuts";

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

export function CodeEditor({
  defaultContent = "",
  defaultFileName = "main",
  defaultLanguage = "python",
  initialTestCases = [{ input: "", expectedOutput: "" }],
  templateCodes = {},
  onSubmit,
}: CodeEditorProps) {
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
    syncWithCloud,
    pullFromCloud,
    removeFile,
    uploadFile, // Make sure this is destructured
  } = useFileManager({
    defaultContent,
    defaultFileName,
    defaultLanguage,
    templateCodes,
  });

  const { getLatestVersion } = usePistonRuntimes();
  const [input, setInput] = useState("");    // changed from testCase
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
  const [searchTerm, setSearchTerm] = useState("");

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
          input     // changed from testCase
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
    input,    // changed from testCase
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

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
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
    },
    [handleRunClick, saveActiveFile]
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

  const handleContextMenu = (event: React.MouseEvent, id: string) => {
    event.preventDefault();
    setContextMenu({ id, x: event.clientX, y: event.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRenameTab = (id: string) => {
    setRenamingFileId(id);
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

  const handleRenameFile = async (id: string, newName: string) => {
    const updatedFiles = files.map((file) => {
      if (file.id === id) {
        const nameWithoutExt = newName.split(".")[0];
        const extension = getLanguageExtension(file.language);
        return { ...file, name: `${nameWithoutExt}.${extension}` };
      }
      return file;
    });

    setFiles(updatedFiles);
    const updatedFile = updatedFiles.find((file) => file.id === id);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }

    setRenamingFileId(null);
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
        defaultSize={editorMode === "editor" ? 85 : 60}
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
                  files={files}
                  activeFile={activeFileId}
                  onSelectFile={handleFileSelect} // Use the new handler here
                  onContextMenu={handleContextMenu}
                  onRenameFile={handleRenameFile}
                  onDeleteFile={handleDeleteFile}
                  onAddFile={addFile} // Đảm bảo truyền prop này
                  isSyncing={isSyncing}
                  syncWithCloud={syncWithCloud}
                  pullFromCloud={pullFromCloud}
                  onUploadFile={uploadFile} // Ensure this prop is correctly passed
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
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
          {editorMode !== "editor" && (
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
                ) : (
                  <MemoizedInputOutputPanel
                    currentTheme={currentTheme}
                    input={input}           // changed from testCase
                    output={output}
                    onInputChange={setInput}     // changed from onTestCaseChange
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
