import { FileTab, CursorPosition } from "../app/types/types";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

interface StatusBarProps {
  activeFile: FileTab | undefined;
  cursorPosition: CursorPosition;
  executionTime: number | null; // Add executionTime prop
}

export function StatusBar({ activeFile, cursorPosition, executionTime }: StatusBarProps) {
  const { theme, toggleTheme, currentTheme } = useTheme();

  return (
    <div className={`${currentTheme.containerBg} ${currentTheme.text} text-[11px] py-1 px-3 flex justify-between items-center border-t ${currentTheme.borderColor} transition-all duration-200`}>
      <div className="flex items-center gap-3">
        <span className="opacity-75">{activeFile?.language || "plaintext"}</span>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 hover:${theme === 'light' ? 'text-gray-800' : 'text-zinc-300'} transition-all duration-200 opacity-75 hover:opacity-100`}
        >
          {theme === "dark" ? <FaSun size={11} /> : <FaMoon size={11} />}
          <span className="capitalize">{theme}</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        {executionTime !== null && (
          <span className="opacity-75">{`Execution Time: ${executionTime}ms`}</span>
        )}
        <span className="opacity-75 hover:opacity-100 transition-opacity">
          {`Ln ${cursorPosition.line}, Col ${cursorPosition.column}`}
        </span>
      </div>
    </div>
  );
}
