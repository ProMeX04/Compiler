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
  const { currentTheme, theme, toggleTheme } = useTheme();

  return (
    <div
      className={`flex items-center ${currentTheme.tabBg} shadow-sm transition-all duration-200`}
    >
      <div className="flex-1 flex items-center">
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

        {/* Updated Mode Toggle */}
        <div className="flex items-center rounded-lg border border-zinc-600 overflow-hidden">
          <button
            onClick={() => onEditorModeChange("code")}
            className={`p-2 text-xs flex items-center gap-1.5 transition-colors ${
              editorMode === "code"
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-800"
            }`}
          >
            <FaCode size={11} />
            <span>Code</span>
          </button>
          <button
            onClick={() => onEditorModeChange("test")}
            className={`p-2 text-xs flex items-center gap-1.5 transition-colors ${
              editorMode === "test"
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-800"
            }`}
          >
            <FaFlask size={11} />
            <span>Test</span>
          </button>
          <button
            onClick={() => onEditorModeChange("editor")}
            className={`p-2 text-xs flex items-center gap-1.5 transition-colors ${
              editorMode === "editor"
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-800"
            }`}
          >
            <FaExpand size={11} />
            <span>Editor</span>
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center rounded-lg border border-zinc-600 overflow-hidden">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className={`p-2 text-xs flex items-center gap-1.5 bg-transparent hover:bg-zinc-800 cursor-pointer outline-none`}  
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
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 text-xs hover:${
            theme === "light" ? "text-gray-800" : "text-zinc-300"
          } transition-all duration-200 opacity-75 hover:opacity-100`}
        >
          {theme === "dark" ? <FaSun size={11} /> : <FaMoon size={11} />}
          <span className="capitalize">{theme}</span>
        </button>

        {/* Run Button */}
        <button
          onClick={onCompileAndRun}
          disabled={isCompiling}
          title="Run (Ctrl+B)"
          className={`p-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center border border-transparent ${
            isCompiling
              ? "text-gray-500 cursor-not-allowed"
              : "text-blue-500 hover:border-blue-500"
          }`}
        >
          {isCompiling ? (
            <FaSpinner className="animate-spin h-4 w-4" />
          ) : (
            <FaPlay className="h-4 w-4" />
          )}
        </button>

        {/* Submit Button - Only show if onSubmit is provided */}
        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={isCompiling}
            title="Submit Solution"
            className="p-2 px-4 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
