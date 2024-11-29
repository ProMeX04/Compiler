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
  FaUser,
  FaUndo,
  FaCloudUploadAlt, // Add this
} from "react-icons/fa";
import { useTheme } from "@/app/contexts/ThemeContext";
import { LANGUAGE_CONFIGS } from "@/app/config/languageConfig";
import { useFirebaseAuth } from "@/app/hooks/useFirebaseAuth";
import { LoginModal } from "@/app/components/LoginModal";
import { useState, useRef, useEffect } from "react";
import Image from 'next/image';

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
  rightElements?: React.ReactNode;
  pullFromCloud: () => void; // Add this
  isSyncing: boolean;  // Add this
  syncWithCloud: () => void; // Add this
  lastSyncTime: Date | null; // Add this
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
  rightElements,
  pullFromCloud,
  isSyncing,
  syncWithCloud,
  lastSyncTime,
}: EditorHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useFirebaseAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalPosition, setLoginModalPosition] = useState({ top: 0, left: 0 });
  const loginButtonRef = useRef<HTMLButtonElement>(null);
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

  const handleUserIconClick = () => {
    if (loginButtonRef.current) {
      const rect = loginButtonRef.current.getBoundingClientRect();
      setLoginModalPosition({ 
        top: rect.bottom + 5, // Add small offset from button
        left: Math.max(10, rect.right - 320) // Align right edge with some padding
      });
    }
    setIsLoginModalOpen(true);
  };

  useEffect(() => {
    if (user) {
      // This effect could be used to notify CodeEditor to fetch user code
      // Alternatively, CodeEditor handles fetching based on user context
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between px-4 h-10 ${
          theme === "light"
            ? "bg-white border-gray-100"
            : "bg-[#1e1e1e] border-[#252526]"
        }`}
      >
        {/* Left section remains unchanged */}
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

        {/* Center/Mid section */}
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

        {/* Right section with cloud sync and user */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border-r dark:border-zinc-700 pr-2">
            <button
              onClick={syncWithCloud}
              disabled={isSyncing}
              title="Save changes to cloud storage"
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${
                theme === "light" 
                  ? "text-blue-600 hover:bg-blue-50" 
                  : "text-blue-400 hover:bg-blue-900/30"
              } disabled:opacity-50`}
            >
              {isSyncing ? (
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <FaCloudUploadAlt className="w-3.5 h-3.5" />
                  <span className="text-xs">Save</span>
                </>
              )}
            </button>
            <button
              onClick={pullFromCloud}
              disabled={isSyncing}
              title="Revert to last saved version"
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${
                theme === "light" 
                  ? "text-orange-600 hover:bg-orange-50" 
                  : "text-orange-400 hover:bg-orange-900/30"
              } disabled:opacity-50`}
            >
              {isSyncing ? (
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <FaUndo className="w-3.5 h-3.5" />
                  <span className="text-xs">Back</span>
                </>
              )}
            </button>
          </div>
          {lastSyncTime && (
            <span className="text-xs text-gray-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
          {rightElements}
          <button
            ref={loginButtonRef}
            onClick={handleUserIconClick}
            className={`${buttonBaseClass} ${buttonInactiveClass} ml-2`}
            title="User"
          >
            {user && user.photoURL ? (
              <Image src={user.photoURL} alt="User Avatar" width={24} height={24} className="rounded-full" />
            ) : (
              <FaUser size={11} />
            )}
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        position={loginModalPosition}
      />
    </div>
  );
}
