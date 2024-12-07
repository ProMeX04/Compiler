"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { EditorHeader } from "@/app/components/EditorHeader";
import { TestPanel } from "@/app/components/EditorMode/TestPanel";
import { CursorPosition, TestCase } from "@/app/types/types";
import "@szhsin/react-menu/dist/index.css";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useFileManager } from "@/app/hooks/useFileManager";
import { usePistonRuntimes } from "@/app/hooks/usePistonRuntimes";
import { saveFileToIDB } from "@/app/utils/idb";
import { defaultMainEditorOptions } from "@/app/config/editor/monaco";
import WelcomeGuide from "@/app/components/WelcomeGuide";
import { PanelResizeHandle } from "react-resizable-panels";
import { MonacoEditor, InputOutputPanel } from "./EditorMode";
import { useCodeExecution } from "../hooks/useCodeExecution";
import { FileExplorer } from "@/app/components/FileExplorer/FileExplorer";
import { addDuplicateLineCommand } from "../config/editor/monaco";
import useTestingState from "@/app/hooks/useTestingState";
import { toast } from "react-hot-toast";
import { create } from 'zustand';
import { getLanguageExtension } from "@/app/config/languagesConfig/categories";
const MemoizedMonacoEditor = React.memo(MonacoEditor);
const MemoizedTestPanel = React.memo(TestPanel);
const MemoizedInputOutputPanel = React.memo(InputOutputPanel);

interface StoreState {
  shareCode: string | null;
  setShareCode: (code: string | null) => void;
  isFormatting: boolean;
  setIsFormatting: (isFormatting: boolean) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  isChatting: boolean;
  setIsChatting: (isChatting: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  shareCode: null,
  setShareCode: (code) => set({ shareCode: code }),
  isFormatting: false,
  setIsFormatting: (isFormatting) => set({ isFormatting }),
  isAnalyzing: false,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  isChatting: false,
  setIsChatting: (isChatting) => set({ isChatting }),
}));

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
  const { shareCode, setShareCode, isFormatting, setIsFormatting, isAnalyzing, setIsAnalyzing, isChatting, setIsChatting } = useStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("shareCode");
    setShareCode(code);
  }, [setShareCode]);

  const {
    files,
    setFiles,
    activeFileId,
    activeFile,
    setActiveFileId,
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
    unshareFile,
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
    removeTestCase,
  } = useTestingState(initialTestCases);
  const [, setCursorPosition] = useState<CursorPosition>({
    line: 1,
    column: 1,
  });
  const { currentTheme, theme } = useTheme();
  const [editorMode, setEditorMode] = useState<"code" | "test" | "editor">(
    "editor"
  );
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    isCompiling,
    setIsCompiling,
    executionTime,
    setExecutionTime,
    executeCodeWithMetrics,
    runTests,
    isRunningCode,
  } = useCodeExecution();

  const compileAndRun = useCallback(async () => {
    if (!activeFile) return;

    const version = getLatestVersion(activeFile.language);
    if (!version) return;

    try {
      const { executionTime: time, output: result } =
        await executeCodeWithMetrics(
          activeFile.content,
          input,
          activeFile.language,
          version
        );

      setOutput(result);
      setExecutionTime(time);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "An error occurred");
    }
  }, [
    activeFile,
    input,
    executeCodeWithMetrics,
    getLatestVersion,
    setOutput,
    setExecutionTime,
  ]);

  const handleRunTests = useCallback(async () => {
    if (!activeFile) return;

    const version = getLatestVersion(activeFile.language);
    if (!version) return;

    try {
      await runTests(
        activeFile.language,
        version,
        activeFile.content,
        testCases,
        (updatedTests) => {
          setTestCases(updatedTests);
        }
      );
    } catch (error) {
      console.error("Error running tests:", error);
      toast.error("Failed to run tests");
    }
  }, [activeFile, getLatestVersion, runTests, testCases, setTestCases]);

  const handleRunClick = useCallback(async () => {
    if (editorMode === "editor") {
      setEditorMode("code");
    }

    if (editorMode === "test") {
      await handleRunTests();
    } else {
      await compileAndRun();
    }
  }, [editorMode, compileAndRun, handleRunTests]);

  const saveActiveFileToCloud = useCallback(async () => {
    if (!activeFile) return;
    try {
      await syncFileWithCloud(activeFile.id);
    } catch {}
  }, [activeFile, syncFileWithCloud]);

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

  const formatCode = useCallback(async () => {
    if (!activeFile) return;

    setIsFormatting(true);
    try {
      const response = await fetch("/api/gemini/format", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language,
        }),
      });

      if (!response.ok) throw new Error("Format request failed");

      const { formattedCode } = await response.json();
      if (formattedCode && activeFileId) {
        await handleTabContentChange(activeFileId, formattedCode);
        toast.success("Code formatted successfully");
      }
    } catch (error) {
      console.error("Error formatting code:", error);
      toast.error("Failed to format code");
    } finally {
      setIsFormatting(false);
    }
  }, [activeFile, activeFileId, handleTabContentChange, setIsFormatting]);

  const analyzeCode = useCallback(async () => {
    if (!activeFile) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language,
        }),
      });

      if (!response.ok) throw new Error("Analyze request failed");

      const { formattedCode } = await response.json();
      if (formattedCode && activeFileId) {
        await handleTabContentChange(activeFileId, formattedCode);
        toast.success("Code analyzed successfully");
      }
    } catch (error) {
      console.error("Error analyzing code:", error);
      toast.error("Failed to analyze code");
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeFile, activeFileId, handleTabContentChange, setIsAnalyzing]);

  const handleChat = useCallback(
    async (message: string) => {
      if (!activeFile) return;

      setIsChatting(true);
      try {
        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: activeFile.content,
            language: activeFile.language,
            message,
          }),
        });

        if (!response.ok) throw new Error("Chat request failed");

        const { formattedCode } = await response.json();
        console.log("Current content:", activeFile.content); // Debug log
        console.log("New content:", formattedCode); // Debug log

        if (formattedCode && activeFileId) {
          // Cập nhật files array trước
          const updatedFiles = files.map((file) =>
            file.id === activeFileId
              ? { ...file, content: formattedCode, isSynced: false }
              : file
          );
          setFiles(updatedFiles);

          // Sau đó cập nhật IDB
          await saveFileToIDB(updatedFiles.find((f) => f.id === activeFileId)!);

          toast.success("Code updated with AI comments");
        } else {
          toast.error("No changes were made to the code");
        }
      } catch (error) {
        console.error("Error in chat:", error);
        toast.error("Failed to get AI response");
      } finally {
        setIsChatting(false);
      }
    },
    [activeFile, activeFileId, files, setFiles, setIsChatting]
  );

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        analyzeCode();
      }
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        formatCode();
      }
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
    [handleRunClick, saveActiveFileToCloud, formatCode, analyzeCode]
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

  const handleLanguageChange = useCallback(
    async (newLanguage: string) => {
      if (!activeFileId) return;

      const updatedFiles = files.map((file) => {
        if (file.id !== activeFileId) return file;
        
        // Get file name without extension
        const baseName = file.name.split('.')[0];
        // Get new extension
        const newExtension = getLanguageExtension(newLanguage);
        // Create new filename
        const newName = `${baseName}.${newExtension}`;

        return {
          ...file,
          name: newName,
          language: newLanguage,
          isSynced: false
        };
      });

      setFiles(updatedFiles);

      const updatedFile = updatedFiles.find((file) => file.id === activeFileId);
      if (updatedFile) {
        await saveFileToIDB(updatedFile);
      }
    },
    [activeFileId, files, setFiles]
  );

  // Add new handler for code changes
  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (activeFileId) {
        handleTabContentChange(activeFileId, newCode);
      }
    },
    [activeFileId, handleTabContentChange]
  );

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
            onFormatCode={formatCode}
            onAnalyzeCode={analyzeCode}
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
      formatCode,
      analyzeCode,
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
          onFormatCode={formatCode}
          isFormatting={isFormatting}
          onAnalyzeCode={analyzeCode}
          isAnalyzing={isAnalyzing}
          isRunningCode={isRunningCode}
          currentContent={activeFile?.content || ""}
          onContentChange={handleCodeChange} // Add this prop
          onChat={handleChat}
          isChatting={isChatting}
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
                  unshareFile={unshareFile}
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

          {(editorMode === "test" || editorMode === "code") && (
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
    </div>
  );
}
