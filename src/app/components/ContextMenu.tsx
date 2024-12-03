import React from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/app/contexts/ThemeContext";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
}

export function ContextMenu({ x, y, onClose, children }: ContextMenuProps) {
  const { theme } = useTheme();

  return createPortal(
    <div
      className="fixed z-50"
      style={{ top: y, left: x }}
      onClick={onClose}
    >
      <div className={`shadow-lg rounded-md overflow-hidden border ${theme === "light" ? "bg-white border-gray-200" : "bg-[#252526] border-[#37373d]"}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}
