"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FileTab } from "@/components/FileTab";
import { ContextMenu } from "@/components/ContextMenu";
import { FileTab as FileTabType, CursorPosition } from "@/app/types/types";
import { FILE_EXTENSIONS } from "@/app/constants/constants";
import { FaPlus, FaSpinner, FaPlay, FaSun, FaMoon, FaCode, FaFlask } from "react-icons/fa";
import "@szhsin/react-menu/dist/index.css";
import "./styles/resizable.css";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTheme } from "@/contexts/ThemeContext";
import { defaultLanguages } from "@/config/editor";
import { PistonRuntime } from "@/app/types/piston";
import { getRuntimes, executeCode } from "@/app/services/piston";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;  // Add actual output to track results
  passed?: boolean;       // Add pass/fail status
}

export default function Home() {
  const [tabs, setTabs] = useState<FileTabType[]>([
    { id: "1", name: "main.cpp", content: "", language: "cpp" },
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
  const { currentTheme, theme, toggleTheme } = useTheme();
  const [runtimes, setRuntimes] = useState<PistonRuntime[]>([]);
  const [testMode, setTestMode] = useState<'code' | 'test'>('code');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '' }
  ]);

  useEffect(() => {
    getRuntimes().then(setRuntimes).catch(console.error);
  }, []);

  useEffect(() => {
    // Đặt theme tùy chỉnh khi component mount
    // monaco.editor.setTheme('myCustomTheme');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        compileAndRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTab, testCase]); // Add dependencies that compileAndRun uses

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split(".").pop() || "";
    return FILE_EXTENSIONS[ext] || "plaintext";
  };

  const addNewFile = () => {
    const newId = String(Date.now());
    const defaultLang = defaultLanguages.python;
    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        name: `untitled.${defaultLang.defaultExt}`,
        content: defaultLang.defaultContent,
        language: defaultLang.name,
      },
    ]);
    setActiveTab(newId);
  };

  const updateTabName = (id: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              name: newName,
              language: getLanguageFromFileName(newName),
            }
          : tab
      )
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

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    setTestCases(prev => prev.map((tc, i) => 
      i === index ? { ...tc, [field]: value } : tc
    ));
  };

  const addTestCase = () => {
    setTestCases(prev => [...prev, { input: '', expectedOutput: '' }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  const compileAndRun = async () => {
    if (!activeFile) return;

    setIsCompiling(true);
    setOutput("");
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const runtime = runtimes.find(r => 
        r.language === activeFile.language || 
        r.aliases.includes(activeFile.language)
      );

      if (!runtime) {
        throw new Error(`Language ${activeFile.language} not supported`);
      }

      if (testMode === 'test') {
        const updatedTestCases = [...testCases];
        for (let i = 0; i < testCases.length; i++) {
          const result = await executeCode({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: activeFile.content }],
            stdin: testCases[i].input
          });

          const testOutput = result.run.stdout.trim();
          const passed = testOutput === testCases[i].expectedOutput.trim();
          
          updatedTestCases[i] = {
            ...testCases[i],
            actualOutput: testOutput,
            passed
          };
        }

        setTestCases(updatedTestCases);
      } else {
        // Normal run mode
        const result = await executeCode({
          language: runtime.language,
          version: runtime.version,
          files: [{ content: activeFile.content }],
          stdin: testCase
        });
        
        const output = [
          result.run.stdout,
          result.run.stderr,
          result.run.code !== 0 ? `Exit code: ${result.run.code}` : null
        ].filter(Boolean).join('\n');

        setOutput(output || "No output");
      }

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error("Execution error:", error);
      setOutput(`System Error: ${error instanceof Error ? error.message : "Unknown error"}`);
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

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const activeFile = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={`flex flex-col h-screen ${currentTheme.bg} ${currentTheme.text} overflow-hidden`}>
      <div className={`flex items-center ${currentTheme.tabBg} shadow-sm transition-all duration-200`}>
        <div className="flex-1 flex items-center">
          {tabs.map((tab) => (
            <FileTab
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onSelect={() => setActiveTab(tab.id)}
              onRemove={() => removeTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              isRenaming={renamingTabId === tab.id}
              onRename={(newName) => updateTabName(tab.id, newName)}
              onRenameComplete={() => setRenamingTabId(null)}
            />
          ))}
          <button
            onClick={addNewFile}
            className={`flex items-center justify-center px-3 h-8 text-sm border-r ${currentTheme.borderColor} ${currentTheme.text} ${currentTheme.tabBg} hover:${currentTheme.tabHoverBg} transition-all duration-200`}
          >
            <FaPlus className="transform hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        <div className="flex items-center gap-4 px-3">
          {/* Status Information */}
          <div className="flex items-center gap-3 text-xs opacity-75">
            {executionTime !== null && (
              <span>{`Execution Time: ${executionTime}ms`}</span>
            )}
          </div>

          {/* Mode Toggle */}
          {/* Mode Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-600 overflow-hidden">
            <button
              onClick={() => setTestMode('code')}
              className={`p-2 text-xs flex items-center gap-1.5 transition-colors ${
                testMode === 'code' 
                  ? 'bg-zinc-700 text-white' 
                  : 'hover:bg-zinc-800'
              }`}
            >
              <FaCode size={11} />
              <span>Code</span>
            </button>
            <button
              onClick={() => setTestMode('test')}
              className={`p-2 text-xs flex items-center gap-1.5 transition-colors ${
                testMode === 'test' 
                  ? 'bg-zinc-700 text-white' 
                  : 'hover:bg-zinc-800'
              }`}
            >
              <FaFlask size={11} />
              <span>Test</span>
            </button>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 text-xs hover:${theme === 'light' ? 'text-gray-800' : 'text-zinc-300'} transition-all duration-200 opacity-75 hover:opacity-100`}
          >
            {theme === "dark" ? <FaSun size={11} /> : <FaMoon size={11} />}
            <span className="capitalize">{theme}</span>
          </button>

          {/* Run Button */}
          <button
            onClick={compileAndRun}
            disabled={isCompiling || !activeFile}
            title="Run (Ctrl+B)"
            className={`p-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center border border-transparent ${
              isCompiling
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-blue-500 hover:border-blue-500'
            }`}
          >
            {isCompiling ? (
              <FaSpinner className="animate-spin h-4 w-4" />
            ) : (
              <FaPlay className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <PanelGroup direction="horizontal" className="flex-1 overflow-auto" style={{ scrollBehavior: 'smooth' }}>
        <Panel defaultSize={50} minSize={20}>
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
                vertical: 'auto',
                horizontal: 'auto',
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
        <ResizeHandle />
        <Panel defaultSize={50} minSize={20}>
          {testMode === 'test' ? (
            <div className={`h-full overflow-auto p-4 ${currentTheme.panelBg}`}>
              <div className="flex flex-col gap-4">
                {/* Add test results summary */}
                <div className={`p-2 rounded ${
                  testCases.some(tc => tc.passed !== undefined)
                    ? theme === 'light' 
                      ? 'bg-gray-100 border border-gray-200' 
                      : 'bg-zinc-800/50 border border-zinc-700'
                    : ''
                }`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Test Cases</h3>
                    <div className="flex items-center gap-4">
                      {testCases.some(tc => tc.passed !== undefined) && (
                        <span className="text-xs opacity-75">
                          Passed: {testCases.filter(tc => tc.passed).length}/{testCases.length}
                        </span>
                      )}
                      <button
                        onClick={addTestCase}
                        className={`text-xs px-2 py-1 rounded border ${
                          theme === 'light' 
                            ? 'border-gray-300 hover:bg-gray-100' 
                            : 'border-zinc-600 hover:bg-zinc-700'
                        } transition-colors`}
                      >
                        Add Test Case
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing test cases list */}
                <div className="space-y-4">
                  {testCases.map((tc, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 p-3 border rounded transition-colors ${
                        tc.passed === undefined
                          ? theme === 'light' ? 'border-gray-300 bg-gray-50' : 'border-zinc-700 bg-zinc-900'
                          : tc.passed
                            ? theme === 'light' ? 'border-green-500/30 bg-green-50' : 'border-green-500/30 bg-green-950'
                            : theme === 'light' ? 'border-red-500/30 bg-red-50' : 'border-red-500/30 bg-red-950'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">Test Case #{index + 1}</span>
                          {tc.passed !== undefined && (
                            <span className={`text-xs ${tc.passed ? 'text-green-400' : 'text-red-400'}`}>
                              {tc.passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeTestCase(index)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs mb-1 opacity-70">Input:</label>
                          <textarea
                            value={tc.input}
                            onChange={(e) => {
                              handleTestCaseChange(index, 'input', e.target.value);
                              autoResize(e);
                            }}
                            onFocus={(e) => autoResize(e)}
                            className={`w-full min-h-[32px] max-h-[200px] rounded p-2 text-xs overflow-y-hidden resize-none ${
                              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-zinc-800/80 border border-zinc-700'
                            }`}
                            style={{ height: 'auto' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1 opacity-70">Expected Output:</label>
                          <textarea
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              handleTestCaseChange(index, 'expectedOutput', e.target.value);
                              autoResize(e);
                            }}
                            onFocus={(e) => autoResize(e)}
                            className={`w-full min-h-[32px] max-h-[200px] rounded p-2 text-xs overflow-y-hidden resize-none ${
                              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-zinc-800/80 border border-zinc-700'
                            }`}
                            style={{ height: 'auto' }}
                          />
                        </div>
                        {tc.actualOutput !== undefined && (
                          <div>
                            <label className="block text-xs mb-1 opacity-70">Actual Output:</label>
                            <textarea
                              value={tc.actualOutput}
                              readOnly
                              className={`w-full min-h-[32px] max-h-[200px] rounded p-2 text-xs overflow-y-auto resize-none ${
                                theme === 'light' ? 'bg-gray-100 border border-gray-200' : 'bg-zinc-800/50'
                              }`}
                              style={{ height: 'auto' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <PanelGroup direction="vertical" className="h-full overflow-auto">
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
                        vertical: 'auto',
                        horizontal: 'auto',
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
                        vertical: 'auto',
                        horizontal: 'auto',
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
      </PanelGroup>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
        >
          <button
            className={`w-full px-4 py-1.5 text-sm text-left ${theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-zinc-700'}`}
            onClick={() => handleRenameTab(contextMenu.id)}
          >
            Rename
          </button>
        </ContextMenu>
      )}
    </div>
  );
}
