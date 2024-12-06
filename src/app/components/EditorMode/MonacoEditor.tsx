import dynamic from "next/dynamic";
import { addMouseWheelZoom } from "../../config/editor/monaco";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useCallback } from "react";

const MonacoEditorBase = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface MonacoEditorProps {
  language: string;
  value: string;
  path?: string;
  onChange: (value: string) => void;
  onMount?: (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => void;
  theme: string;
  options?: Monaco.editor.IStandaloneEditorConstructionOptions;
  height?: string | number;
  onFormatCode?: () => Promise<void>;  // Make optional
  onAnalyzeCode?: () => Promise<void>;  // Make optional
}

let suggestionsRegistered = false;

export function MonacoEditor({
  language,
  value,
  path,
  onChange,
  onMount,
  theme,
  options = {},
  height = "100%",
  onFormatCode,
  onAnalyzeCode,
}: MonacoEditorProps) {
  const handleEditorDidMount = useCallback(
    async (
      editor: Monaco.editor.IStandaloneCodeEditor,
      monaco: typeof Monaco
    ) => {
      if (onMount) {
        onMount(editor, monaco);
      }

      // Only add context menu items if callbacks are provided
      if (onFormatCode) {
        editor.addAction({
          id: 'format-code',
          label: 'Format Code',
          keybindings: [
            monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
          ],
          contextMenuGroupId: 'modification',
          run: onFormatCode
        });
      }

      if (onAnalyzeCode) {
        editor.addAction({
          id: 'analyze-code',
          label: 'Analyze Code',
          keybindings: [
            monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyA
          ],
          contextMenuGroupId: 'modification',
          run: onAnalyzeCode
        });
      }

      addMouseWheelZoom(editor);
      if (typeof window !== "undefined" && !suggestionsRegistered) {
        const { registerLanguageSuggestions } = await import(
          "../../config/languagesConfig/suggesstions"
        );
        registerLanguageSuggestions(monaco);
        suggestionsRegistered = true;
      }
    },
    [onMount, onFormatCode, onAnalyzeCode]
  );

  return (
    <MonacoEditorBase
      height={height}
      language={language}
      value={value}
      path={path}
      onChange={(value) => onChange(value || "")}
      onMount={handleEditorDidMount}
      theme={theme}
      options={options}
    />
  );
}
