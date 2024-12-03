import React, { memo, useCallback } from "react";
import {
  FaSun,
  FaMoon,
  FaCode,
  FaFlask,
  FaPlay,
  FaSpinner,
  FaExpand,
  FaBars,
  FaUser,
} from "react-icons/fa";
import { useTheme } from "@/app/contexts/ThemeContext";
import {
  LANGUAGE_CONFIGS,
  getLanguageIcon,
} from "@/app/config/languagesConfig/categories";
import { useFirebaseAuth } from "@/app/hooks/useFirebaseAuth";
import { LoginModal } from "@/app/components/LoginModal";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// Update button styles with modern design
const BUTTON_BASE =
  "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200";
const BUTTON_ACTIVE = (theme: string) =>
  theme === "light"
    ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 shadow-md ring-2 ring-blue-300"
    : "bg-gradient-to-r from-blue-800 to-blue-900 text-blue-300 shadow-inner ring-2 ring-blue-700";
const BUTTON_INACTIVE = (theme: string) =>
  theme === "light"
    ? "hover:bg-gray-100 text-gray-700 hover:text-gray-900 hover:shadow-md"
    : "hover:bg-zinc-700 text-gray-300 hover:text-gray-100 hover:shadow-inner";

// Create reusable button component
const HeaderButton = memo(
  React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ onClick, disabled, className, children }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`${BUTTON_BASE} ${className}`}
    >
      {children}
    </button>
  ))
);
HeaderButton.displayName = "HeaderButton";

// Add this new style constant
const SELECT_STYLES = (theme: string) => `
  ${BUTTON_BASE} ${BUTTON_INACTIVE(theme)}
  min-w-[130px] relative appearance-none pr-8 pl-3
  ${
    theme === "light"
      ? "bg-gradient-to-r from-gray-100 to-gray-200 ring-2 ring-gray-400 hover:from-gray-200 hover:to-gray-300"
      : "bg-[#2a2a2a] ring-2 ring-zinc-700 hover:bg-[#333]"
  }
`;

// Adjust icon colors for dark mode
const getIconColor = (theme: string, currentLanguage: string) => {
  const colors = {
    cpp: theme === "light" ? "#00599C" : "#2E96FF",
    c: theme === "light" ? "#283593" : "#5C6BC0",
    python: theme === "light" ? "#306998" : "#FFD43B",
    javascript: theme === "light" ? "#F0DB4F" : "#F7DF1E",
    typescript: theme === "light" ? "#007ACC" : "#49B0FF",
    java: theme === "light" ? "#E76F00" : "#FF9248",
    csharp: theme === "light" ? "#239120" : "#4EC94E",
    go: theme === "light" ? "#00ADD8" : "#29BDF7",
    rust: theme === "light" ? "#B7410E" : "#FF5722",
    ruby: theme === "light" ? "#CC342D" : "#FF5252",
    php: theme === "light" ? "#777BB3" : "#9898E6",
    swift: theme === "light" ? "#FA7343" : "#FF9573",
    kotlin: theme === "light" ? "#B125EA" : "#D667FF",
    scala: theme === "light" ? "#DC322F" : "#FF5655",
    haskell: theme === "light" ? "#5D4F85" : "#9179CB",
    lua: theme === "light" ? "#000080" : "#5151FF",
    r: theme === "light" ? "#276DC2" : "#4C9EFF",
  };
  return (
    colors[currentLanguage as keyof typeof colors] ||
    (theme === "light" ? "#666666" : "#CCCCCC")
  );
};

interface EditorHeaderProps {
  editorMode: "code" | "test" | "editor";
  isCompiling: boolean;
  executionTime: number | null;
  onEditorModeChange: (mode: "code" | "test" | "editor") => void;
  onCompileAndRun: () => void;
  onSubmit?: () => void;
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
  isExplorerVisible: boolean;
  toggleExplorer: () => void;
  rightElements?: React.ReactNode;
}

export const EditorHeader = memo(function EditorHeader({
  editorMode,
  isCompiling,
  executionTime,
  onEditorModeChange,
  onCompileAndRun,
  onLanguageChange,
  currentLanguage,
  toggleExplorer,
}: EditorHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useFirebaseAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalPosition, setLoginModalPosition] = useState({
    top: 0,
    left: 0,
  });
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
        left: Math.max(10, rect.right - 320), // Align right edge with some padding
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
        className={`flex items-center justify-between px-4 h-10 border-b ${
          theme === "light"
            ? "bg-gradient-to-r from-white to-gray-100 border-gray-300"
            : "bg-gradient-to-r from-[#2a2a2a] to-[#333] border-[#3a3a3a]"
        }`}
      >
        {/* Left section */}
        <div className="flex items-center space-x-3">
          <HeaderButton
            onClick={toggleExplorer}
            className={`${BUTTON_INACTIVE(
              theme
            )} hover:rotate-[360deg] duration-500`}
            title="Toggle Explorer"
          >
            <FaBars
              className="w-4 h-4"
              style={{ color: theme === "light" ? "#6366f1" : "#818cf8" }}
            />
          </HeaderButton>

          <div className="h-5 w-[1px] mx-2 opacity-20 bg-current" />

          {/* Move language selector here */}
          <div className="relative flex items-center">
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className={SELECT_STYLES(theme)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${
                  theme === "light" ? "%23666" : "%23999"
                }'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                backgroundSize: "16px",
              }}
            >
              {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
                <option
                  key={lang}
                  value={lang}
                  className={
                    theme === "light"
                      ? "bg-white text-gray-800"
                      : "bg-[#2a2a2a] text-gray-300"
                  }
                >
                  {config.displayName}
                </option>
              ))}
            </select>
            <span className="absolute right-7 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-90">
              <div style={{ color: getIconColor(theme, currentLanguage) }}>
                {getLanguageIcon(currentLanguage)}
              </div>
            </span>
          </div>
        </div>

        {/* Center section */}
        <div className="flex items-center gap-3">
          {/* Move Run button here */}
          <HeaderButton
            onClick={handleRunClick}
            disabled={isCompiling}
            title="Run Code (Ctrl+B)"
            className={`${
              isCompiling
                ? "opacity-50 cursor-not-allowed"
                : theme === "light"
                ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 hover:from-emerald-200 hover:to-green-200 ring-2 ring-emerald-300"
                : "bg-gradient-to-r from-emerald-800 to-green-800 text-emerald-300 hover:from-emerald-900 hover:to-green-900 ring-2 ring-emerald-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {isCompiling ? (
                <FaSpinner
                  className="animate-spin w-4 h-4"
                  style={{ color: theme === "light" ? "#059669" : "#34d399" }}
                />
              ) : (
                <>
                  <FaPlay
                    className="w-3 h-3"
                    style={{ color: theme === "light" ? "#059669" : "#34d399" }}
                  />
                  <div className="flex items-center gap-1">
                    <span>Run</span>
                    {executionTime && (
                      <span
                        className={`text-[10px] px-1 py-0.5 rounded-sm ${
                          theme === "light"
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-emerald-900 text-emerald-400"
                        }`}
                      >
                        {executionTime}ms
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </HeaderButton>

          <div
            className={`flex items-center rounded-lg p-1 ${
              theme === "light" ? "bg-gray-200" : "bg-zinc-700"
            }`}
          >
            {[
              {
                mode: "code",
                icon: FaCode,
                label: "Code",
                color: theme === "light" ? "#3b82f6" : "#60a5fa",
              },
              {
                mode: "test",
                icon: FaFlask,
                label: "Test",
                color: theme === "light" ? "#8b5cf6" : "#a78bfa",
              },
              {
                mode: "editor",
                icon: FaExpand,
                label: "Full",
                color: theme === "light" ? "#f59e0b" : "#fbbf24",
              },
            ].map(({ mode, icon: Icon, label, color }) => (
              <HeaderButton
                key={mode}
                onClick={() =>
                  onEditorModeChange(mode as "code" | "test" | "editor")
                }
                className={`px-3 py-1.5 ${
                  editorMode === mode
                    ? BUTTON_ACTIVE(theme)
                    : BUTTON_INACTIVE(theme)
                }`}
                title={label}
              >
                <Icon size={12} style={{ color }} />
              </HeaderButton>
            ))}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <HeaderButton
            onClick={toggleTheme}
            className={`${BUTTON_INACTIVE(theme)} hover:rotate-90 duration-300`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <FaSun size={12} style={{ color: "#fbbf24" }} />
            ) : (
              <FaMoon size={12} style={{ color: "#6366f1" }} />
            )}
          </HeaderButton>

          <HeaderButton
            ref={loginButtonRef}
            onClick={handleUserIconClick}
            className={`${BUTTON_INACTIVE(
              theme
            )} p-2 min-w-[36px] min-h-[36px] flex items-center justify-center`}
            title="User Account"
          >
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={28}
                height={28}
                className="rounded-full w-7 h-7 object-cover"
              />
            ) : (
              <FaUser size={16} />
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
