import {
  FaPlus,
  FaSun,
  FaMoon,
  FaCode,
  FaFlask,
  FaPlay,
  FaSpinner,
  FaExpand,
  FaBars,
} from "react-icons/fa";
import { useTheme } from "@/app/contexts/ThemeContext";
import { LANGUAGE_CONFIGS } from "@/app/config/languageConfig";

interface EditorHeaderProps {
  editorMode: "code" | "test" | "editor";
  isCompiling: boolean;
  executionTime: number | null;
  onAddFile: () => void;
  onEditorModeChange: (mode: "code" | "test" | "editor") => void;
  onCompileAndRun: () => void;
  onSubmit?: () => void;
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
  isExplorerVisible: boolean;
  toggleExplorer: () => void;
}

export function EditorHeader({
  editorMode,
  isCompiling,
  executionTime,
  onAddFile,
  onEditorModeChange,
  onCompileAndRun,
  onSubmit,
  onLanguageChange,
  currentLanguage,
  toggleExplorer,
}: EditorHeaderProps) {
  const { theme, toggleTheme } = useTheme();
    const buttonBaseClass = "flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors";
  const buttonActiveClass = theme === 'light' 
    ? "bg-gray-200 text-gray-800" 
    : "bg-zinc-700 text-white";
  const buttonInactiveClass = theme === 'light'
    ? "hover:bg-gray-200 text-gray-600"
    : "hover:bg-zinc-800 text-zinc-300";

  const handleRunClick = () => {
    if (editorMode === "editor") {
      onEditorModeChange("code");
    }
    onCompileAndRun();
  };

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between px-4 h-10 ${
          theme === "light"
            ? "bg-white border-gray-100"
            : "bg-[#1e1e1e] border-[#252526]"
        }`}
      >
        {/* Left section with buttons */}
        <div className="flex-1 flex items-center gap-1">
          <button
            onClick={toggleExplorer}
            className={`${buttonBaseClass} ${buttonInactiveClass}`}
          >
            <FaBars className="w-3 h-3" />
          </button>
          <button
            onClick={onAddFile}
            className={`${buttonBaseClass} ${buttonInactiveClass}`}
          >
            <FaPlus className="w-3 h-3" />
          </button>
          <button
            onClick={handleRunClick}
            disabled={isCompiling}
            title="Run (Ctrl+B)"
            className={`${buttonBaseClass} ${
              isCompiling
                ? "opacity-50 cursor-not-allowed"
                : buttonInactiveClass
            }`}
          >
            {isCompiling ? (
              <FaSpinner className="animate-spin w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
          </button>
          {executionTime !== null && (
            <span
              className={`text-[11px] ${
                theme === "light" ? "text-gray-600" : "text-zinc-500"
              }`}
            >
              {executionTime}ms
            </span>
          )}
        </div>

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
            <div
              className={`flex items-center rounded ${
                theme === "light" ? "bg-gray-200/50" : "bg-zinc-800/50"
              }`}
            >
              <button
                onClick={() => onEditorModeChange("code")}
                className={`${buttonBaseClass} ${
                  editorMode === "code"
                    ? buttonActiveClass
                    : buttonInactiveClass
                }`}
                title="Run Code"
              >
                <FaCode size={11} />
              </button>
              <button
                onClick={() => onEditorModeChange("test")}
                className={`${buttonBaseClass} ${
                  editorMode === "test"
                    ? buttonActiveClass
                    : buttonInactiveClass
                }`}
                title="Test Cases"
              >
                <FaFlask size={11} />
              </button>
              <button
                onClick={() => onEditorModeChange("editor")}
                className={`${buttonBaseClass} ${
                  editorMode === "editor"
                    ? buttonActiveClass
                    : buttonInactiveClass
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
                  className={theme === "light" ? "bg-gray-100" : "bg-zinc-800"}
                >
                  {config.displayName}
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`${buttonBaseClass} ${buttonInactiveClass}`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <FaSun size={11} /> : <FaMoon size={11} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
