import React from "react";
import { createPortal } from "react-dom";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
}

export function ContextMenu({ x, y, onClose, children }: ContextMenuProps) {
  return createPortal(
    <div
      className="fixed z-50"
      style={{ top: y, left: x }}
      onClick={onClose}
    >
      <div className="bg-white dark:bg-[#252526] shadow-lg rounded-md overflow-hidden border dark:border-[#37373d]">
        {children}
      </div>
    </div>,
    document.body
  );
}
