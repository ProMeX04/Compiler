import { FileTab as FileTabType } from "../types/types";
import { FaRegTimesCircle } from "react-icons/fa";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getLanguageIcon } from "@/app/config/languageConfig";

interface FileTabProps {
  tab: FileTabType;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isRenaming: boolean;
  onRename: (newName: string) => void;
  onRenameComplete: () => void;
  // Add any additional props needed for parameterization
}

export function FileTab({
  tab,
  isActive,
  onSelect,
  onRemove,
  onContextMenu,
  isRenaming,
  onRename,
  onRenameComplete,
  // ...other props...
}: FileTabProps) {
  const { currentTheme, theme } = useTheme();

  return (
    <div
      className={`group flex items-center px-3 h-8 cursor-pointer text-xs border-r ${
        currentTheme.borderColor
      } relative transition-all duration-200 ${
        isActive
          ? `${currentTheme.text} ${currentTheme.tabActiveBg} border-t-2 border-t-blue-500`
          : `${theme === "light" ? "text-gray-600" : "text-zinc-400"} ${
              currentTheme.tabBg
            } hover:${currentTheme.tabHoverBg}`
      }`}
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
      {isRenaming ? (
        <input
          type="text"
          value={tab.name}
          onChange={(e) => onRename(e.target.value)}
          onBlur={onRenameComplete}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameComplete();
          }}
          className="bg-transparent w-24 min-w-0 outline-none text-inherit"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex items-center">
          {getLanguageIcon(tab.language)}
          <span className="truncate max-w-[140px]">{tab.name}</span>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={`ml-2 opacity-0 group-hover:opacity-100 hover:${
          theme === "light" ? "text-gray-800" : "text-zinc-300"
        } transition-all duration-200`}
      >
        <FaRegTimesCircle />
      </button>
    </div>
  );
}
