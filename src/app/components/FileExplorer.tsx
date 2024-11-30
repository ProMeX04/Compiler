import React, { useState } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getLanguageIcon } from "@/app/config/languagesConfig/categories";
import { FileTab } from "@/app/types/types";
import { ContextMenu } from "@/app/components/ContextMenu";
import {
  FaPencilAlt,
  FaTrash,
  FaPlus,
  FaCloudUploadAlt,
  FaUndo,
  FaSpinner,
} from "react-icons/fa";

interface FileExplorerProps {
  files: FileTab[];
  activeFile: string | null;
  onSelectFile: (id: string) => void;
  onContextMenu: (event: React.MouseEvent, id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onAddFile: () => void;
  isSyncing: boolean;
  syncWithCloud: () => void;
  pullFromCloud: () => void;
}

export const FileExplorer = React.memo(function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onRenameFile,
  onDeleteFile,
  onAddFile,
  isSyncing,
  syncWithCloud,
  pullFromCloud,
}: FileExplorerProps) {
  const { theme } = useTheme();
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    id: string;
  } | null>(null);

  const handleRenameComplete = () => {
    if (renamingFileId) {
      onRenameFile(renamingFileId, newFileName);
      setRenamingFileId(null);
      setNewFileName("");
    }
  };

  const handleContextMenuOpen = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  return (
    <div
      className={`w-100 h-full overflow-y-auto transition-colors duration-200 
      ${
        theme === "light"
          ? "bg-gradient-to-br from-gray-50 to-white"
          : "bg-gradient-to-br from-[#1e1e1e] to-[#252526]"
      }`}
    >
      <div
        className={`p-3 flex justify-between items-center text-sm font-semibold border-b transition-all
          ${
            theme === "light"
              ? "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"
              : "bg-[#252526] text-gray-200 border-[#333] hover:bg-[#2a2a2a]"
          }`}
      >
        <div className="flex items-center gap-2">
          <span
            className="ml-2 cursor-pointer"
            onClick={() => onSelectFile("")}
          >
            Files
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={syncWithCloud}
              disabled={isSyncing}
              className={`p-1.5 rounded-md transition-colors
                ${
                  theme === "light"
                    ? "text-blue-500 hover:bg-blue-50"
                    : "text-blue-400 hover:bg-blue-900/20"
                } disabled:opacity-50`}
              title="Save to Cloud"
            >
              {isSyncing ? (
                <FaSpinner className="w-3 h-3 animate-spin" />
              ) : (
                <FaCloudUploadAlt className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={pullFromCloud}
              disabled={isSyncing}
              className={`p-1.5 rounded-md transition-colors
                ${
                  theme === "light"
                    ? "text-amber-500 hover:bg-amber-50"
                    : "text-amber-400 hover:bg-amber-900/20"
                } disabled:opacity-50`}
              title="Restore from Cloud"
            >
              <FaUndo className="w-3 h-3" />
            </button>
          </div>
        </div>
        <button
          onClick={onAddFile}
          className={`p-1.5 rounded-md transition-colors
            ${
              theme === "light"
                ? "hover:bg-gray-200 text-gray-600"
                : "hover:bg-zinc-700 text-gray-400"
            }`}
          title="New File"
        >
          <FaPlus className="w-3 h-3" />
        </button>
      </div>

      <div className="py-2">
        {files
          .filter((file) => file.active)
          .map((file) => (
            <div
              key={file.id}
              className={`flex items-center px-3 py-2 cursor-pointer transition-all duration-200
              ${
                activeFile === file.id
                  ? theme === "light"
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                    : "bg-[#37373d] text-blue-300 border-l-4 border-blue-400"
                  : theme === "light"
                  ? "hover:bg-gray-50 text-gray-700 border-l-4 border-transparent"
                  : "hover:bg-[#2a2d2e] text-gray-300 border-l-4 border-transparent"
              }`}
              onClick={() => onSelectFile(file.id)}
              onContextMenu={(e) => handleContextMenuOpen(e, file.id)}
            >
              <span className="mr-3 opacity-80">
                {file.language && getLanguageIcon(file.language)}
              </span>
              {renamingFileId === file.id ? (
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={handleRenameComplete}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameComplete();
                  }}
                  className={`bg-transparent w-full px-2 py-1 rounded outline-none text-inherit
                  ${
                    theme === "light"
                      ? "focus:bg-white focus:ring-2 focus:ring-blue-200"
                      : "focus:bg-[#1e1e1e] focus:ring-2 focus:ring-blue-500"
                  }`}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className={`text-sm font-medium transition-colors hover:text-opacity-100
                ${
                  activeFile === file.id
                    ? "text-opacity-100"
                    : "text-opacity-80"
                }`}
                >
                  {file.name}
                </span>
              )}
            </div>
          ))}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleContextMenuClose}
        >
          <button
            className={`w-full px-4 py-2 text-sm text-left transition-colors
              ${
                theme === "light"
                  ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  : "text-gray-200 hover:bg-blue-900/20 hover:text-blue-400"
              }`}
            onClick={() => {
              setRenamingFileId(contextMenu.id);
              handleContextMenuClose();
            }}
          >
            <div className="flex items-center gap-3">
              <FaPencilAlt size={12} />
              <span>Rename</span>
            </div>
          </button>
          <button
            className={`w-full px-4 py-2 text-sm text-left transition-colors
              ${
                theme === "light"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-red-400 hover:bg-red-900/20"
              }`}
            onClick={() => {
              onDeleteFile(contextMenu.id);
              handleContextMenuClose();
            }}
          >
            <div className="flex items-center gap-3">
              <FaTrash size={12} />
              <span>Delete</span>
            </div>
          </button>
        </ContextMenu>
      )}
    </div>
  );
});
