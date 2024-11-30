import dynamic from "next/dynamic";
import { addMouseWheelZoom } from "../../config/editor/shortcuts";
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
}: MonacoEditorProps) {
  const handleEditorDidMount = useCallback(
    async (
      editor: Monaco.editor.IStandaloneCodeEditor,
      monaco: typeof Monaco
    ) => {
      if (onMount) {
        onMount(editor, monaco);
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
    [onMount]
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
