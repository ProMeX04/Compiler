import React, { memo, useCallback, useState, useEffect, useRef } from "react";
import { toast } from 'react-hot-toast'; 
import {
  FaSun,
  FaMoon,
  FaPlay,
  FaSpinner,
  FaBars,
  FaUser,
  FaCode, 
  FaFlask,
  FaExpandAlt, 
  FaWrench,
  FaBroom, 
} from "react-icons/fa";
import { RiAiGenerate, RiSendPlaneFill } from 'react-icons/ri';
import { useTheme } from "@/app/contexts/ThemeContext";
import {
  LANGUAGE_CONFIGS,
  getLanguageIcon,
} from "@/app/config/languagesConfig/categories";
import { useFirebaseAuth } from "@/app/hooks/useFirebaseAuth";
import { LoginModal } from "@/app/components/LoginModal";
import Image from "next/image";
import { create } from 'zustand';
import Modal from 'react-modal';

const BUTTON_BASE =
  "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded-md transition-all duration-200";
const BUTTON_ACTIVE = (theme: string) =>
  theme === "light"
    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200"
    : "bg-gradient-to-r from-blue-900/30 to-blue-800/30 text-blue-400 shadow-inner ring-1 ring-blue-800";
const BUTTON_INACTIVE = (theme: string) =>
  theme === "light"
    ? "hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:shadow-sm"
    : "hover:bg-zinc-800/80 text-gray-400 hover:text-gray-200 hover:shadow-inner";

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

const SELECT_STYLES = (theme: string) => `
  ${BUTTON_BASE} ${BUTTON_INACTIVE(theme)}
  min-w-[120px] relative appearance-none pr-7 pl-2
  ${
    theme === "light"
      ? "bg-gradient-to-r from-gray-50 to-gray-100 ring-1 ring-gray-300 hover:from-gray-100 hover:to-gray-200"
      : "bg-[#1e1e1e] ring-1 ring-zinc-800 hover:bg-[#252526]"
  }
`;

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
  onFormatCode: () => Promise<void>;
  onAnalyzeCode: () => Promise<void>;
  isAnalyzing: boolean;
  isRunningCode: boolean;
  currentContent: string;
  onContentChange: (content: string) => void;
  onChat: (message: string) => Promise<void>;
  isChatting: boolean;
}

interface StoreState {
  message: string;
  isAskingAI: boolean;
}

interface StoreActions {
  setMessage: (message: string) => void;
  setIsAskingAI: (isAskingAI: boolean) => void;
}

const useStore = create<StoreState & StoreActions>((set) => ({
  message: '',
  setMessage: (message) => set({ message }),
  isAskingAI: false,
  setIsAskingAI: (isAskingAI) => set({ isAskingAI }),
}));

export const EditorHeader = memo(function EditorHeader({
  editorMode,
  isCompiling,
  executionTime,
  onEditorModeChange,
  onCompileAndRun,
  onLanguageChange,
  currentLanguage,
  toggleExplorer,
  onFormatCode,
  isFormatting,
  onAnalyzeCode,
  isAnalyzing,
  isRunningCode,
  onChat,
}: EditorHeaderProps & { 
  isFormatting: boolean,
}) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useFirebaseAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const { message, setMessage, isAskingAI, setIsAskingAI } = useStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try different possible root elements
      const possibleRootElements = ['#root', '#__next', 'body'];
      for (const selector of possibleRootElements) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            Modal.setAppElement(element as HTMLElement);
            break;
          }
        } catch {
          console.warn(`Failed to set app element with selector: ${selector}`);
        }
      }
    }
  }, []);

  const handleRunClick = useCallback(() => {
    if (editorMode === "editor") {
      onEditorModeChange("code");
    }
    onCompileAndRun();
  }, [editorMode, onEditorModeChange, onCompileAndRun]);

  const handleUserIconClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isAskingAI) return;

    setIsAskingAI(true);
    try {
      await onChat(message);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsAskingAI(false);
      setMessage('');
    }
  };

  useEffect(() => {
    if (user) {
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between px-3 h-8 border-b ${
          theme === "light"
            ? "bg-gradient-to-r from-white to-gray-50 border-gray-200"
            : "bg-gradient-to-r from-[#1e1e1e] to-[#252526] border-[#2d2d2d]"
        }`}
      >
        {/* Left section */}
        <div className="flex items-center space-x-2">
          <HeaderButton
            onClick={toggleExplorer}
            className={`${BUTTON_INACTIVE(
              theme
            )} hover:rotate-[360deg] duration-500`}
            title="Toggle Explorer"
          >
            <FaBars
              className="w-3 h-3"
              style={{ color: theme === "light" ? "#6366f1" : "#818cf8" }}
            />
          </HeaderButton>

          <div className="h-4 w-[1px] mx-1 opacity-20 bg-current" />
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
                backgroundPosition: "right 6px center",
                backgroundSize: "14px",
              }}
            >
              {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
                <option
                  key={lang}
                  value={lang}
                  className={
                    theme === "light"
                      ? "bg-white text-gray-800"
                      : "bg-[#1e1e1e] text-gray-300"
                  }
                >
                  {config.displayName}
                </option>
              ))}
            </select>
            <span className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-90">
              <div style={{ color: getIconColor(theme, currentLanguage) }}>
                {getLanguageIcon(currentLanguage)}
              </div>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Features Group */}
          <HeaderButton
            onClick={onAnalyzeCode}
            disabled={isCompiling || isAnalyzing}
            title="Analyze Code (Alt+Shift+A)"
            className={`${BUTTON_INACTIVE(theme)}`}
          >
            <div className="flex items-center gap-1.5">
              {isAnalyzing ? (
                <FaSpinner className="animate-spin w-3 h-3" />
              ) : (
                <>
                  <FaWrench
                    className="w-3 h-3"
                    style={{ color: theme === "light" ? "#ec4899" : "#f472b6" }}
                  />
                  <span>Analyze</span>
                </>
              )}
            </div>
          </HeaderButton>

          {/* Format button */}
          <HeaderButton
            onClick={onFormatCode}
            disabled={isCompiling || isFormatting} // Disable when formatting
            title="Format Code (Alt+Shift+F)"
            className={`${BUTTON_INACTIVE(theme)}`}
          >
            <div className="flex items-center gap-1.5">
              {isFormatting ? (
                <FaSpinner className="animate-spin w-3 h-3" />
              ) : (
                <>
                  <FaBroom
                    className="w-3 h-3"
                    style={{ color: theme === "light" ? "#8b5cf6" : "#a78bfa" }}
                  />
                  <span>Format</span>
                </>
              )}
            </div>
          </HeaderButton>

          <form onSubmit={handleAskAI} className="flex items-center">
            <div className="relative group w-64">
              <div className={`absolute left-2 top-1/2 -translate-y-1/2 transition-colors ${
                theme === 'light'
                  ? 'text-gray-400 group-hover:text-blue-400'
                  : 'text-gray-500 group-hover:text-blue-500'
              }`}>
                <RiAiGenerate className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask AI about code..."
                className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-md transition-all duration-200 ${
                  theme === 'light' 
                    ? 'bg-gray-50/80 backdrop-blur border border-gray-200 placeholder-gray-400 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' 
                    : 'bg-zinc-800/30 backdrop-blur border border-zinc-700 placeholder-gray-500 hover:border-blue-500/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                } outline-none`}
                disabled={isAskingAI}
              />
              <button
                type="submit"
                disabled={isAskingAI || !message.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
                  message.trim() 
                    ? theme === 'light'
                      ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                    : theme === 'light'
                      ? 'text-gray-300'
                      : 'text-gray-600'
                }`}
                title="Ask AI"
              >
                {isAskingAI ? (
                  <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RiSendPlaneFill 
                    className={`w-3.5 h-3.5 transform transition-all duration-200 ${
                      message.trim() ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-50'
                    }`}
                  />
                )}
              </button>
            </div>
          </form>

          <HeaderButton
            onClick={handleRunClick}
            disabled={isCompiling || isRunningCode}
            title="Run Code (Ctrl+B)"
            className={`${
              isCompiling || isRunningCode
                ? "opacity-50 cursor-not-allowed"
                : theme === "light"
                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 hover:from-emerald-100 hover:to-green-100 ring-1 ring-emerald-200"
                : "bg-gradient-to-r from-emerald-900/20 to-green-900/20 text-emerald-400 hover:from-emerald-900/30 hover:to-green-900/30 ring-1 ring-emerald-800/30"
            } transition-all duration-200 transform ${
              isRunningCode ? "scale-95" : ""
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isCompiling || isRunningCode ? (
                <FaSpinner
                  className="animate-spin w-3 h-3"
                  style={{ color: theme === "light" ? "#059669" : "#34d399" }}
                />
              ) : (
                <>
                  <FaPlay
                    className={`w-2.5 h-2.5 transition-transform duration-200 ${
                      isRunningCode ? "scale-90" : ""
                    }`}
                    style={{ color: theme === "light" ? "#059669" : "#34d399" }}
                  />
                  <div className="flex items-center gap-1">
                    <span>Run</span>
                    {executionTime && (
                      <span
                        className={`text-[9px] px-1 py-0.5 rounded-sm ${
                          theme === "light"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-emerald-900/30 text-emerald-400"
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
            className={`flex items-center rounded-lg p-0.5 ${
              theme === "light" ? "bg-gray-100" : "bg-zinc-800/50"
            }`}
          >
            {[
              {
                mode: "code",
                icon: FaCode, // Changed from FaCog to FaCode
                label: "Code",
                color: theme === "light" ? "#3b82f6" : "#60a5fa",
              },
              {
                mode: "test",
                icon: FaFlask, // Changed from FaVial to FaFlask
                label: "Test",
                color: theme === "light" ? "#8b5cf6" : "#a78bfa",
              },
              {
                mode: "editor",
                icon: FaExpandAlt, // Changed from FaExpand to FaExpandAlt
                label: "Full",
                color: theme === "light" ? "#f59e0b" : "#fbbf24",
              }
            ].map(({ mode, icon: Icon, label, color }) => (
              <HeaderButton
                key={mode}
                onClick={() =>
                  onEditorModeChange(mode as "code" | "test" | "editor")
                }
                className={`px-2 py-1 ${
                  editorMode === mode
                    ? BUTTON_ACTIVE(theme)
                    : BUTTON_INACTIVE(theme)
                }`}
                title={label}
              >
                <Icon size={10} style={{ color }} />
              </HeaderButton>
            ))}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-[1px] mx-1 opacity-20 bg-current" />
          
          {/* Theme toggle button với hiệu ứng mới */}
          <HeaderButton
            onClick={toggleTheme}
            className={`${BUTTON_INACTIVE(theme)} hover:rotate-[360deg] duration-500`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <FaSun size={11} className="text-amber-400" />
            ) : (
              <FaMoon size={11} className="text-indigo-400" />
            )}
          </HeaderButton>

          {/* User button với hiệu ứng mới */}
          <HeaderButton
            ref={loginButtonRef}
            onClick={handleUserIconClick}
            className={`${BUTTON_INACTIVE(theme)} p-1.5 hover:ring-2 ${
              theme === 'light' 
                ? 'hover:ring-blue-100' 
                : 'hover:ring-blue-500/20'
            }`}
            title="User Account"
          >
            {user?.photoURL ? (
              <div className="relative rounded-full overflow-hidden w-6 h-6 ring-2 ring-white/10">
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <FaUser size={12} />
                {!user && <span className="text-xs font-medium">Login</span>}
              </div>
            )}
          </HeaderButton>
        </div>
      </div>


      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
});
