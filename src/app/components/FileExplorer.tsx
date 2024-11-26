import React, { useState } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getLanguageIcon } from "@/app/config/languageConfig";
import { FileTab } from "@/app/types/types";
import { ContextMenu } from "@/app/components/ContextMenu";

interface FileExplorerProps {
  files: FileTab[];
  activeTab: string;
  onSelectFile: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

export function FileExplorer({ files, activeTab, onSelectFile, onRenameFile }: FileExplorerProps) {
  const { theme } = useTheme();
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

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
    <div className={`w-100 h-full overflow-y-auto ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e]'}`}>
      <div className={`p-2 text-sm font-medium ${theme === 'light' ? 'bg-gray-50 text-gray-700' : 'bg-[#252526] text-gray-300'}`}>
        File
      </div>
      <div className="py-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center px-2 py-1 cursor-pointer ${
              activeTab === file.id
                ? theme === 'light'
                  ? 'bg-blue-50/40 text-blue-600'
                  : 'bg-[#37373d] text-blue-300'
                : ''
            } hover:${theme === 'light' ? 'bg-gray-50' : 'bg-[#2a2d2e]'}`}
            onClick={() => onSelectFile(file.id)}
            onContextMenu={(e) => handleContextMenuOpen(e, file.id)}
          >
            <span className="mr-2">{file.language && getLanguageIcon(file.language)}</span>
            {renamingFileId === file.id ? (
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={handleRenameComplete}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameComplete();
                }}
                className="bg-transparent w-24 min-w-0 outline-none text-inherit"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm">{file.name}</span>
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
            className={`w-full px-4 py-1.5 text-sm text-left ${
              theme === "light"
                ? "text-gray-800 hover:bg-gray-100"
                : "text-white hover:bg-zinc-700"
            }`}
            onClick={() => {
              setRenamingFileId(contextMenu.id);
              handleContextMenuClose();
            }}
          >
            Rename
          </button>
          {/* Add more context menu actions here */}
        </ContextMenu>
      )}
    </div>
  );
}