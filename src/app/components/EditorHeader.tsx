import {
  FaPlus,
  FaSun,
  FaMoon,
  FaCode,
  FaFlask,
  FaPlay,
  FaSpinner,
  FaExpand,
} from "react-icons/fa";
import { FileTab as FileTabType } from "@/app/types/types";
import { FileTab } from "./FileTab";
import { useTheme } from "@/app/contexts/ThemeContext";
import { LANGUAGE_CONFIGS } from "@/app/config/languageConfig";

interface EditorHeaderProps {
  tabs: FileTabType[];
  activeTab: string;
  editorMode: "code" | "test" | "editor";
  isCompiling: boolean;
  executionTime: number | null;
  onAddFile: () => void;
  onSelectTab: (id: string) => void;
  onRemoveTab: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onRenameTab: (id: string, newName: string) => void;
  onEditorModeChange: (mode: "code" | "test" | "editor") => void;
  onCompileAndRun: () => void;
  renamingTabId: string | null;
  onRenameComplete: () => void;
  onSubmit?: () => void;
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
  // Add any additional props needed for parameterization
}

export function EditorHeader({
  tabs,
  activeTab,
  editorMode,
  isCompiling,
  executionTime,
  onAddFile,
  onSelectTab,
  onRemoveTab,
  onContextMenu,
  onRenameTab,
  onEditorModeChange,
  onCompileAndRun,
  renamingTabId,
  onRenameComplete,
  onSubmit,
  onLanguageChange,
  currentLanguage,
  // ...other props...
}: EditorHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  // Điều chỉnh base style cho buttons để nhỏ hơn
  const buttonBaseClass = "flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors";
  const buttonActiveClass = "bg-zinc-700 text-white";
  const buttonInactiveClass = "hover:bg-zinc-800 text-zinc-300";

  return (
    <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800">
      <div
        className={`flex items-center justify-between px-4 border-b ${
          theme === 'light' 
            ? 'bg-gray-100 border-gray-200' 
            : 'bg-zinc-800 border-zinc-700'
        }`}
      >
        {/* Left section with tabs */}
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <FileTab
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onSelect={() => onSelectTab(tab.id)}
              onRemove={() => onRemoveTab(tab.id)}
              onContextMenu={(e) => onContextMenu(e, tab.id)}
              isRenaming={renamingTabId === tab.id}
              onRename={(newName) => onRenameTab(tab.id, newName)}
              onRenameComplete={onRenameComplete}
            />
          ))}
          <button
            onClick={onAddFile}
            className={`${buttonBaseClass} ${buttonInactiveClass}`}
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </div>

        {/* Center section with run controls */}
        <div className="flex items-center justify-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          <button
            onClick={onCompileAndRun}
            disabled={isCompiling}
            title="Run (Ctrl+B)"
            className={`${buttonBaseClass} ${
              isCompiling ? 'opacity-50 cursor-not-allowed' : buttonInactiveClass
            } ${editorMode === 'editor' ? 'hidden' : ''}`}
          >
            {isCompiling ? (
              <FaSpinner className="animate-spin w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
          </button>
          {executionTime !== null && (
            <span className="text-[11px] text-zinc-500">
              {executionTime}ms
            </span>
          )}
        </div>

        {/* Right section with controls */}
        <div className="flex items-center gap-1.5">
          {onSubmit && (
            <button
              onClick={onSubmit}
              className={`${buttonBaseClass} bg-blue-500 text-white hover:bg-blue-600`}
              disabled={isCompiling}
            >
              Submit
            </button>
          )}

          <div className="flex items-center gap-1.5">
            {/* Mode Toggle */}
            <div className="flex items-center rounded bg-zinc-800/50">
              <button
                onClick={() => onEditorModeChange("code")}
                className={`${buttonBaseClass} ${
                  editorMode === "code" ? buttonActiveClass : buttonInactiveClass
                }`}
                title="Run Code"
              >
                <FaCode size={11} />
              </button>
              <button
                onClick={() => onEditorModeChange("test")}
                className={`${buttonBaseClass} ${
                  editorMode === "test" ? buttonActiveClass : buttonInactiveClass
                }`}
                title="Test Cases"
              >
                <FaFlask size={11} />
              </button>
              <button
                onClick={() => onEditorModeChange("editor")}
                className={`${buttonBaseClass} ${
                  editorMode === "editor" ? buttonActiveClass : buttonInactiveClass
                }`}
                title="Full Screen"
              >
                <FaExpand size={11} />
              </button>
            </div>

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className={`${buttonBaseClass} ${buttonInactiveClass} bg-transparent cursor-pointer outline-none`}
            >
              {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
                <option 
                  key={lang} 
                  value={lang}
                  className="bg-zinc-800"
                >
                  {config.displayName}
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`${buttonBaseClass} ${buttonInactiveClass}`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === "dark" ? <FaSun size={11} /> : <FaMoon size={11} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
