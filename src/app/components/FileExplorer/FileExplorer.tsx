import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getLanguageIcon } from "@/app/config/languagesConfig/categories";
import { FileTab } from "@/app/types/types";
import { FaPlus, FaUpload, FaSearch } from "react-icons/fa";
import {
  MdOutlineCloudSync,
  MdCloudDownload,
  MdOutlineCloudDone,
  MdHistory,
} from "react-icons/md";
import Fuse from "fuse.js";
import { toast } from "react-hot-toast";
import { create } from 'zustand';
import DropdownMenu from '@/app/components/DropdownMenu'; // Add import for DropdownMenu

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

interface StoreState {
  renamingFileId: string | null;
  newFileName: string;
  openDropdownId: string | null; // Add this line
}

interface StoreActions {
  setRenamingFileId: (id: string | null) => void;
  setNewFileName: (name: string) => void;
  setOpenDropdownId: (id: string | null) => void; // Add this line
}

const useStore = create<StoreState & StoreActions>((set) => ({
  renamingFileId: null,
  newFileName: "",
  openDropdownId: null, // Add this line
  setRenamingFileId: (id) => set({ renamingFileId: id }),
  setNewFileName: (name) => set({ newFileName: name }),
  setOpenDropdownId: (id) => set({ openDropdownId: id }), // Add this line
}));

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
  const { renamingFileId, newFileName, openDropdownId, setRenamingFileId, setNewFileName, setOpenDropdownId } = useStore(); // Modify this line
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRenameComplete = () => {
    if (renamingFileId) {
      onRenameFile(renamingFileId, newFileName);
      setRenamingFileId(null);
      setNewFileName("");
    }
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

  const handleDownloadFile = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const file = files.find((f) => f.id === id);
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
    },
    [files]
  );

  const getToastStyle = useCallback(
    () => ({
      style: {
        backgroundColor: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#374151" : "#fff",
        border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
      },
    }),
    [theme]
  );

  const handleShareFile = async (id: string) => {
    try {
      const link = await shareFile(id);
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!", getToastStyle());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to share file",
        getToastStyle()
      );
    }
  };

  const handleToggleShare = async (id: string) => {
    try {
      const file = files.find((f) => f.id === id);
      if (file?.isShared) {
        await unshareFile(id);
        toast.success("File unshared", getToastStyle());
      } else {
        await handleShareFile(id);
      }
    } catch {
      toast.error("Failed to toggle share status", getToastStyle());
    }
  };

  const handleSyncFile = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await syncFileWithCloud(id);
      toast.success("File saved to cloud", getToastStyle());
    } catch {
      toast.error("Failed to save file to cloud", getToastStyle());
    }
  };

  const handlePullFile = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await pullFileFromCloud(id);
      toast.success("File restored from cloud", getToastStyle());
    } catch {
      toast.error("Failed to restore file from cloud", getToastStyle());
    }
  };

  const handleSaveAll = async () => {
    try {
      await saveAllFiles();
      toast.success("All files saved to cloud", getToastStyle());
    } catch {
      toast.error("Failed to save all files", getToastStyle());
    }
  };

  const handlePullAll = async () => {
    try {
      await pullAllFromCloud();
      toast.success("All files restored from cloud", getToastStyle());
    } catch {
      toast.error("Failed to restore files from cloud", getToastStyle());
    }
  };

  useEffect(() => {
    const handleWindowClick = () => {
      setOpenDropdownId(null); // Close any open dropdown
    };

    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, [setOpenDropdownId]);

  const fuseOptions = {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 1,
  };

  const getFilteredFiles = (files: FileTab[], searchTerm: string) => {
    if (!searchTerm) return files.filter((file) => file.active);

    const fuse = new Fuse(
      files.filter((file) => file.active),
      fuseOptions
    );
    const results = fuse.search(searchTerm);
    return results.map((result) => result.item);
  };

  // Update setRenamingFileId to also set initial name
  const startRenaming = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setRenamingFileId(fileId);
      setNewFileName(file.name); // Set the current name instead of empty string
    }
  };

  // Update the places where we start renaming
  const handleRenameTab = (id: string) => {
    startRenaming(id);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
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
        onClick={() => onSelectFile("")} // Add this line
        className={`p-4 flex flex-col gap-3 border-b transition-all cursor-pointer hover:opacity-80 // Add cursor-pointer and hover effect
          ${
            theme === "light"
              ? "bg-gradient-to-r from-white to-gray-50 text-gray-700 border-gray-100"
              : "bg-gradient-to-r from-[#252526] to-[#2d2d2d] text-gray-200 border-[#333]"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">
              Explorer
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                theme === "light"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-zinc-700 text-gray-300"
              }`}
            >
              {files.filter((f) => f.active).length} files
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveAll}
              disabled={isSyncing}
              className={`p-2 rounded-md transition-colors
                ${
                  theme === "light"
                    ? "hover:bg-white text-gray-600 hover:text-green-500 hover:shadow-sm"
                    : "hover:bg-[#333] text-gray-400 hover:text-green-400"
                } disabled:opacity-50`}
              title="Save all to cloud"
            >
              <MdOutlineCloudSync className="w-4 h-4" />
            </button>
            <button
              onClick={handlePullAll}
              disabled={isSyncing}
              className={`p-2 rounded-md transition-colors
                ${
                  theme === "light"
                    ? "hover:bg-white text-gray-600 hover:text-blue-500 hover:shadow-sm"
                    : "hover:bg-[#333] text-gray-400 hover:text-blue-400"
                } disabled:opacity-50`}
              title="Restore all from cloud"
            >
              <MdCloudDownload className="w-4 h-4" />
            </button>
            <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={handleUploadClick}
              className={`p-2 rounded-md transition-colors
                ${
                  theme === "light"
                    ? "hover:bg-white text-gray-600 hover:text-indigo-500 hover:shadow-sm"
                    : "hover:bg-[#333] text-gray-400 hover:text-indigo-400"
                }`}
              title="Upload File"
            >
              <FaUpload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAddFile}
              className={`p-2 rounded-md transition-colors
                ${
                  theme === "light"
                    ? "hover:bg-white text-gray-600 hover:text-violet-500 hover:shadow-sm"
                    : "hover:bg-[#333] text-gray-400 hover:text-violet-400"
                }`}
              title="New File"
            >
              <FaPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search files..."
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-colors
              ${
                theme === "light"
                  ? "bg-white shadow-sm border border-gray-200 focus:border-blue-400 placeholder:text-gray-400"
                  : "bg-[#1e1e1e] border border-zinc-700 focus:border-blue-500 placeholder:text-gray-600"
              }
            `}
          />
          <FaSearch
            className={`absolute left-3 top-2.5 w-3.5 h-3.5 
            ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}
          />
        </div>
      </div>

      <div className="py-2">
        {getFilteredFiles(files, searchTerm).map((file) => (
          <div
            key={file.id}
            className={`group flex items-center px-4 py-2.5 mx-2 mb-1 cursor-pointer rounded-lg transition-all duration-200
            ${
              activeFile === file.id
                ? theme === "light"
                  ? "bg-blue-50/80 text-blue-600 shadow-sm ring-1 ring-blue-100"
                  : "bg-[#37373d] text-blue-300 shadow-[0_0_10px_rgba(0,0,0,0.1)] ring-1 ring-blue-500/20"
                : theme === "light"
                ? "hover:bg-gray-100 text-gray-700 hover:shadow-sm"
                : "hover:bg-[#2a2d2e] text-gray-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            }`}
            onClick={() => onSelectFile(file.id)}
          >
            <span className="mr-3 flex items-center justify-center w-5 h-5 opacity-80">
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
            <div className="flex items-center gap-2 ml-2">
              {!file.isSynced && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleSyncFile(e, file.id)}
                    className={`p-1.5 rounded-md transition-colors ${
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
                    className={`p-1.5 rounded-md transition-colors ${
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
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  Shared
                </span>
              )}
            </div>
            <DropdownMenu
              file={file}
              isOpen={openDropdownId === file.id} // Add this prop
              onToggle={() => toggleDropdown(file.id)} // Add this prop
              onRenameTab={handleRenameTab}
              onDeleteFile={onDeleteFile}
              onDownloadFile={handleDownloadFile}
              onToggleShare={handleToggleShare}
              theme={theme}
            />
          </div>
        ))}
      </div>

      <input
        type="file"
        accept=".js,.ts,.py,.cpp,.c,.java,.cs,.go,.rs,.php,.swift,.kt,.scala,.hs,.lua,.r"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
});
