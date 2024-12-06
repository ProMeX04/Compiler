import React from "react";
import { FaPencilAlt, FaTrash, FaDownload, FaShareAlt } from "react-icons/fa";
import { FileTab } from "@/app/types/types";

interface DropdownMenuProps {
  file: FileTab;
  isOpen: boolean; // Add this line
  onToggle: () => void; // Add this line
  onRenameTab: (id: string) => void;
  onDownloadFile: (e: React.MouseEvent, id: string) => void;
  onToggleShare: (id: string) => void;
  onDeleteFile: (id: string) => void;
  theme: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  file,
  isOpen, // Add this line
  onToggle, // Add this line
  onRenameTab,
  onDownloadFile,
  onToggleShare,
  onDeleteFile,
  theme,
}) => {
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-2">
        {/* Icon for dropdown, e.g., three dots */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v0m0 14v0m0-7h0" />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
          theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800"
        }`}>
          <button
            className={`w-full px-4 py-2 text-sm text-left ${
              theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"
            }`}
            onClick={() => { onRenameTab(file.id); onToggle(); }} // Modify this line
          >
            <FaPencilAlt className="inline mr-2" /> Rename
          </button>
          <button
            className={`w-full px-4 py-2 text-sm text-left ${
              theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"
            }`}
            onClick={(e) => { onDownloadFile(e, file.id); onToggle(); }} // Modify this line
          >
            <FaDownload className="inline mr-2" /> Download
          </button>
          <button
            className={`w-full px-4 py-2 text-sm text-left ${
              theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-gray-700"
            }`}
            onClick={() => { onToggleShare(file.id); onToggle(); }} // Modify this line
          >
            <FaShareAlt className="inline mr-2" /> {file.isShared ? "Unshare" : "Share"}
          </button>
          <button
            className={`w-full px-4 py-2 text-sm text-left ${
              theme === "light" ? "text-red-600 hover:bg-red-100" : "text-red-400 hover:bg-red-700"
            }`}
            onClick={() => { onDeleteFile(file.id); onToggle(); }} // Modify this line
          >
            <FaTrash className="inline mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;