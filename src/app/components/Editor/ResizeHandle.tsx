import { PanelResizeHandle } from "react-resizable-panels";

interface ResizeHandleProps {
  className?: string;
  // Add any additional props needed for parameterization
}

export function ResizeHandle({ className = "", /* ...other props... */ }: ResizeHandleProps) {
  return (
    <PanelResizeHandle
      className={`hover:bg-zinc-700 active:bg-zinc-600 transition-colors ${className}`}
    />
  );
}

export default ResizeHandle;