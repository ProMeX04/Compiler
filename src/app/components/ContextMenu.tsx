import { useEffect } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
  // Add any additional props needed for parameterization
}

export function ContextMenu({
  x,
  y,
  onClose,
  children,
  // ...other props...
}: ContextMenuProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div
      className={`fixed z-50 ${
        theme === "light"
          ? "bg-white border-gray-200"
          : "bg-zinc-800 border-zinc-700"
      } border rounded-lg shadow-lg py-1.5 transition-all duration-200 min-w-[120px]`}
      style={{ left: x, top: y }}
    >
      {children}
    </div>
  );
}
