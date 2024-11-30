import { Panel, PanelGroup } from "react-resizable-panels";
import { MonacoEditor } from "./MonacoEditor";
import { PanelResizeHandle } from "react-resizable-panels";
import { defaultInputOutputEditorOptions } from "../../config/editor/monaco";
interface InputOutputPanelProps {
  currentTheme: { name: string; panelBg: string };
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  onOutputChange: (value: string) => void;
}

export function InputOutputPanel({
  currentTheme,
  input,
  output,
  onInputChange,
  onOutputChange,
}: InputOutputPanelProps) {
  return (
    <PanelGroup direction="vertical" className="h-full overflow-auto">
      <Panel defaultSize={40} minSize={5}>
        <div
          className={`h-full ${currentTheme.panelBg} border-b border-gray-200 dark:border-zinc-800`}
        >
          <MonacoEditor
            language="plaintext"
            value={input}
            onChange={onInputChange}
            theme={currentTheme.name}
            options={defaultInputOutputEditorOptions}
          />
        </div>
      </Panel>
      <PanelResizeHandle className={`h-[1px] bg-gray-200 dark:bg-zinc-800`} />
      <Panel defaultSize={60} minSize={5}>
        <div className={`h-full ${currentTheme.panelBg}`}>
          <MonacoEditor
            language="plaintext"
            value={output}
            onChange={onOutputChange}
            theme={currentTheme.name}
            options={defaultInputOutputEditorOptions}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
}