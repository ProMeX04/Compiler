import { Panel, PanelGroup } from "react-resizable-panels";
import { MonacoEditor } from "./MonacoEditor";
import { ResizeHandle } from "./ResizeHandle";

interface InputOutputPanelProps {
  currentTheme: { name: string; panelBg: string };
  testCase: string;
  output: string;
  onTestCaseChange: (value: string) => void;
  onOutputChange: (value: string) => void;
  // Add any additional props needed for parameterization
}

export function InputOutputPanel({
  currentTheme,
  testCase,
  output,
  onTestCaseChange,
  onOutputChange,
  // ...other props...
}: InputOutputPanelProps) {
  return (
    <PanelGroup direction="vertical" className="h-full overflow-auto">
      <Panel defaultSize={40} minSize={5}>
        <div className={`h-full ${currentTheme.panelBg}`}>
          <MonacoEditor
            language="plaintext"
            value={testCase}
            onChange={onTestCaseChange}
            theme={currentTheme.name}
          />
        </div>
      </Panel>
      <ResizeHandle className="h-[2px]" />
      <Panel defaultSize={60} minSize={5}>
        <div className={`h-full ${currentTheme.panelBg}`}>
          <MonacoEditor
            language="plaintext"
            value={output}
            onChange={onOutputChange}
            theme={currentTheme.name}
            options={{ readOnly: true }}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
}