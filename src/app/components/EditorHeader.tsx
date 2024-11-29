import React, { memo, useCallback } from "react";
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

// Extract button styles to constants
const BUTTON_BASE = "flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors";
const BUTTON_ACTIVE = (theme: string) => 
  theme === 'light' ? "bg-gray-200 text-gray-800" : "bg-zinc-700 text-white";
const BUTTON_INACTIVE = (theme: string) =>
  theme === 'light' ? "hover:bg-gray-200 text-gray-600" : "hover:bg-zinc-800 text-zinc-300";

// Create reusable button component
const HeaderButton = memo(
  React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ onClick, disabled, className, children }, ref) => (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={`${BUTTON_BASE} ${className}`}
      >
        {children}
      </button>
    )
  )
);
HeaderButton.displayName = "HeaderButton";

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

export const EditorHeader = memo(function EditorHeader({
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

  // Memoize handlers
  const handleRunClick = useCallback(() => {
    if (editorMode === "editor") {
      onEditorModeChange("code");
    }
    onCompileAndRun();
  }, [editorMode, onEditorModeChange, onCompileAndRun]);

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
          <HeaderButton
            onClick={toggleExplorer}
            className={BUTTON_INACTIVE(theme)}
          >
            <FaBars className="w-3 h-3" />
          </HeaderButton>
          <HeaderButton
            onClick={onAddFile}
            className={BUTTON_INACTIVE(theme)}
          >
            <FaPlus className="w-3 h-3" />
          </HeaderButton>
          <HeaderButton
            onClick={handleRunClick}
            disabled={isCompiling}
            title="Run (Ctrl+B)"
            className={isCompiling ? "opacity-50 cursor-not-allowed" : BUTTON_INACTIVE(theme)}
          >
            {isCompiling ? (
              <FaSpinner className="animate-spin w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
          </HeaderButton>
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
            <HeaderButton
              onClick={onSubmit}
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={isCompiling}
            >
              Submit
            </HeaderButton>
          )}

          <div className="flex items-center gap-1.5">
            {/* Mode Toggle */}
            <div
              className={`flex items-center rounded ${
                theme === "light" ? "bg-gray-200/50" : "bg-zinc-800/50"
              }`}
            >
              <HeaderButton
                onClick={() => onEditorModeChange("code")}
                className={editorMode === "code" ? BUTTON_ACTIVE(theme) : BUTTON_INACTIVE(theme)}
                title="Run Code"
              >
                <FaCode size={11} />
              </HeaderButton>
              <HeaderButton
                onClick={() => onEditorModeChange("test")}
                className={editorMode === "test" ? BUTTON_ACTIVE(theme) : BUTTON_INACTIVE(theme)}
                title="Test Cases"
              >
                <FaFlask size={11} />
              </HeaderButton>
              <HeaderButton
                onClick={() => onEditorModeChange("editor")}
                className={editorMode === "editor" ? BUTTON_ACTIVE(theme) : BUTTON_INACTIVE(theme)}
                title="Full Screen"
              >
                <FaExpand size={11} />
              </HeaderButton>
            </div>

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className={`${BUTTON_BASE} ${BUTTON_INACTIVE(theme)} bg-transparent cursor-pointer outline-none`}
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
            <HeaderButton
              onClick={toggleTheme}
              className={BUTTON_INACTIVE(theme)}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <FaSun size={11} /> : <FaMoon size={11} />}
            </HeaderButton>
          </div>
        </div>

        {/* Right section with cloud sync and user */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border-r dark:border-zinc-700 pr-2">
            <HeaderButton
              onClick={syncWithCloud}
              disabled={isSyncing}
              title="Save changes to cloud storage"
              className={`${
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
            </HeaderButton>
            <HeaderButton
              onClick={pullFromCloud}
              disabled={isSyncing}
              title="Revert to last saved version"
              className={`${
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
            </HeaderButton>
          </div>
          {lastSyncTime && (
            <span className="text-xs text-gray-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
          {rightElements}
          <HeaderButton
            ref={loginButtonRef}
            onClick={handleUserIconClick}
            className={`${BUTTON_INACTIVE(theme)} ml-2`}
            title="User"
          >
            {user && user.photoURL ? (
              <Image src={user.photoURL} alt="User Avatar" width={24} height={24} className="rounded-full" />
            ) : (
              <FaUser size={11} />
            )}
          </HeaderButton>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        position={loginModalPosition}
      />
    </div>
  );
});
