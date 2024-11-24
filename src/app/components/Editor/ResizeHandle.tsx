import { PanelResizeHandle } from "react-resizable-panels";

interface ResizeHandleProps {
  className?: string;
}

export function ResizeHandle({ className = "" }: ResizeHandleProps) {
  return (
    <PanelResizeHandle
      className={`hover:bg-zinc-700 active:bg-zinc-600 transition-colors ${className}`}
    />
  );
}

export default ResizeHandle;