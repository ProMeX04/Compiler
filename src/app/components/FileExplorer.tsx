import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getLanguageIcon } from "@/app/config/languagesConfig/categories";
import { FileTab } from "@/app/types/types";
import { ContextMenu } from "@/app/components/ContextMenu";
import {
  FaPencilAlt,
  FaTrash,
  FaPlus,
  FaUpload,
  FaSearch,
  FaDownload,
  FaShareAlt,
} from "react-icons/fa";
import { 
  MdOutlineCloudSync,
  MdCloudDownload,
  MdOutlineCloudDone,
  MdHistory 
} from "react-icons/md";
import Fuse from 'fuse.js';
import { toast } from 'react-hot-toast';

export interface FileExplorerProps {
  files: FileTab[];
  activeFile: string | null;
  onSelectFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onAddFile: () => void;
  isSyncing: boolean;
  onUploadFile: (file: File) => void;
  searchTerm?: string;
  onSearch: (term: string) => void;
  saveAllFiles: () => void;
  pullAllFromCloud: () => void;
  updateFile: (id: string, data: Partial<FileTab>) => void;
  syncFileWithCloud: (id: string) => void;
  pullFileFromCloud: (id: string) => void;
  shareFile: (id: string) => Promise<string>;
  unshareFile: (id: string) => Promise<void>;
}

export const FileExplorer = React.memo(function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onRenameFile,
  onDeleteFile,
  onAddFile,
  isSyncing,
  onUploadFile,
  searchTerm = "",
  onSearch,
  saveAllFiles,
  pullAllFromCloud,
  syncFileWithCloud,
  pullFileFromCloud,  
  shareFile,
  unshareFile,
}: FileExplorerProps) {
  const { theme } = useTheme();
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    id: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRenameComplete = () => {
    if (renamingFileId) {
      onRenameFile(renamingFileId, newFileName);
      setRenamingFileId(null);
      setNewFileName("");
    }
  };

  const handleContextMenuOpen = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadFile) { 
      onUploadFile(file);
    }
  };

  const handleDownloadFile = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const file = files.find(f => f.id === id);
    if (!file) return;

    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleContextMenuClose();
  }, [files]);

  const getToastStyle = useCallback(() => ({
    style: {
      backgroundColor: theme === 'light' ? '#fff' : '#333',
      color: theme === 'light' ? '#374151' : '#fff',
      border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`,
    }
  }), [theme]);

  const handleShareFile = async (id: string) => {
    try {
      const link = await shareFile(id);
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!', getToastStyle());
      handleContextMenuClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to share file", getToastStyle());
    }
  };

  const handleToggleShare = async (id: string) => {
    try {
      const file = files.find(f => f.id === id);
      if (file?.isShared) {
        await unshareFile(id);
        toast.success('File unshared', getToastStyle());
      } else {
        await handleShareFile(id);
      }
      handleContextMenuClose();
    } catch {
      toast.error('Failed to toggle share status', getToastStyle());
    }
  };

  const handleSyncFile = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await syncFileWithCloud(id);
      toast.success('File saved to cloud', getToastStyle());
    } catch {
      toast.error('Failed to save file to cloud', getToastStyle());
    }
  };

  const handlePullFile = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await pullFileFromCloud(id);
      toast.success('File restored from cloud', getToastStyle());
    } catch {
      toast.error('Failed to restore file from cloud', getToastStyle());
    }
  };

  const handleSaveAll = async () => {
    try {
      await saveAllFiles();
      toast.success('All files saved to cloud', getToastStyle());
    } catch {
      toast.error('Failed to save all files', getToastStyle());
    }
  };

  const handlePullAll = async () => {
    try {
      await pullAllFromCloud();
      toast.success('All files restored from cloud', getToastStyle());
    } catch {
      toast.error('Failed to restore files from cloud', getToastStyle());
    }
  };

  useEffect(() => {
    const handleWindowClick = () => {
      setContextMenu(null);
    };

    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const fuseOptions = {
    keys: ['name'],
    threshold: 0.4, 
    includeScore: true,
    minMatchCharLength: 1
  };

  const getFilteredFiles = (files: FileTab[], searchTerm: string) => {
    if (!searchTerm) return files.filter(file => file.active);

    const fuse = new Fuse(files.filter(file => file.active), fuseOptions);
    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  };

  // Update setRenamingFileId to also set initial name
  const startRenaming = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setRenamingFileId(fileId);
      setNewFileName(file.name); // Set the current name instead of empty string
    }
  };

  // Update the places where we start renaming
  const handleRenameTab = (id: string) => {
    startRenaming(id);
    handleContextMenuClose();
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
        <div className="flex items-center justify-between w-full">
          <span className="ml-2 cursor-pointer" onClick={() => onSelectFile("")}>
            Files
          </span>
          
          <div className="flex items-center">
            <div className="flex items-center gap-1 mr-3 border-r pr-3 border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveAll}
                disabled={isSyncing}
                className={`p-1.5 rounded-md transition-colors
                  ${
                    theme === "light"
                      ? "text-green-500 hover:bg-green-50"
                      : "text-green-400 hover:bg-green-900/20"
                  } disabled:opacity-50`}
                title="Save all to cloud"
              >
                <MdOutlineCloudSync className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePullAll}
                disabled={isSyncing}
                className={`p-1.5 rounded-md transition-colors
                  ${
                    theme === "light"
                      ? "text-blue-500 hover:bg-blue-50"
                      : "text-blue-400 hover:bg-blue-900/20"
                  } disabled:opacity-50`}
                title="Restore all from cloud"
              >
                <MdCloudDownload className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleUploadClick}
                className={`p-1.5 rounded-md transition-colors
                  ${
                    theme === "light"
                      ? "hover:bg-gray-200 text-gray-600"
                      : "hover:bg-zinc-700 text-gray-400"
                  }`}
                title="Upload File"
              >
                <FaUpload className="w-3 h-3" />
              </button>
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
              <input
                type="file"
                accept=".js,.ts,.py,.cpp,.java,.cs"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`px-3 py-2 border-b ${
        theme === "light" 
          ? "border-gray-100" 
          : "border-zinc-800"
      }`}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search files..."
            className={`w-full pl-8 pr-3 py-1.5 text-sm rounded-md outline-none transition-colors
              ${theme === "light"
                ? "bg-gray-50 focus:bg-white border border-gray-200 focus:border-blue-400"
                : "bg-zinc-800 focus:bg-zinc-900 border border-zinc-700 focus:border-blue-500"
              }
            `}
          />
          <FaSearch className={`absolute left-2.5 top-2.5 w-3 h-3 
            ${theme === "light" ? "text-gray-400" : "text-gray-500"}`} 
          />
        </div>
      </div>

      <div className="py-2">
        {getFilteredFiles(files, searchTerm).map((file) => (
          <div
            key={file.id}
            className={`group flex items-center px-3 py-2 cursor-pointer transition-all duration-200
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
                className={`text-sm font-medium flex-1 transition-colors hover:text-opacity-100
              ${
                activeFile === file.id
                  ? "text-opacity-100"
                  : "text-opacity-80"
              }`}
              >
                {file.name}
              </span>
            )}
            {/* Thay đổi hiển thị nút sync */}
            {!file.isSynced && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={(e) => handleSyncFile(e, file.id)}
                  className={`p-1 rounded-md transition-colors ${
                    theme === "light"
                      ? "text-blue-500 hover:bg-blue-50"
                      : "text-blue-400 hover:bg-blue-900/20"
                  }`}
                  title="Save to cloud"
                >
                  <MdOutlineCloudDone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handlePullFile(e, file.id)}
                  className={`p-1 rounded-md transition-colors ${
                    theme === "light"
                      ? "text-amber-500 hover:bg-amber-50"
                      : "text-amber-400 hover:bg-amber-900/20"
                  }`}
                  title="Restore from cloud"
                >
                  <MdHistory className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {file.isShared && (
              <span className="ml-2 text-xs text-green-500">Shared</span>
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
          <div onClick={(e) => e.stopPropagation()}> {/* Add this wrapper */}
            <button
              className={`w-full px-4 py-2 text-sm text-left transition-colors
                ${
                  theme === "light"
                    ? "text-gray-700 bg-white hover:bg-gray-50"
                    : "text-gray-200 hover:bg-blue-900/20 hover:text-blue-400"
                }`}
              onClick={() => handleRenameTab(contextMenu.id)}
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
                    ? "text-gray-700 bg-white hover:bg-gray-50"
                    : "text-gray-200 hover:bg-blue-900/20 hover:text-blue-400"
                }`}
              onClick={(e) => handleDownloadFile(e, contextMenu.id)}
            >
              <div className="flex items-center gap-3">
                <FaDownload size={12} />
                <span>Download</span>
              </div>
            </button>
            <button
              className={`w-full px-4 py-2 text-sm text-left transition-colors
                ${
                  theme === "light"
                    ? "text-gray-700 bg-white hover:bg-gray-50"
                    : "text-gray-200 hover:bg-blue-900/20 hover:text-blue-400"
                }`}
              onClick={() => handleToggleShare(contextMenu.id)}
            >
              <div className="flex items-center gap-3">
                <FaShareAlt size={12} />
                <span>
                  {files.find(f => f.id === contextMenu.id)?.isShared 
                    ? 'Unshare' 
                    : 'Share'
                  }
                </span>
              </div>
            </button>
            <button
              className={`w-full px-4 py-2 text-sm text-left transition-colors
                ${
                  theme === "light"
                    ? "text-red-600 bg-white hover:bg-red-50"
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
          </div>
        </ContextMenu>
      )}
    </div>
  );
});
