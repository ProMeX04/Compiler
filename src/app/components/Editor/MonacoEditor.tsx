import dynamic from "next/dynamic";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { addMouseWheelZoom } from './shortcuts';

const MonacoEditorBase = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface MonacoEditorProps {
  language: string;
  value: string;
  path?: string;
  onChange: (value: string) => void;
  onMount?: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => void;
  theme: string;
  options?: Monaco.editor.IStandaloneEditorConstructionOptions;
  height?: string | number;
}

export function MonacoEditor({
  language,
  value,
  path,
  onChange,
  onMount,
  theme,
  options = {},
  height = "100%",
  // ...other props...
}: MonacoEditorProps) {
  const defaultOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
    fontFamily: "Cascadia Mono",
    fontSize: 14,
    lineHeight: 24,
    minimap: { enabled: false },
    smoothScrolling: true,
    scrollBeyondLastLine: false,
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      verticalSliderSize: 8,
      horizontalSliderSize: 8,
    },
    lineNumbersMinChars: 2,
    lineDecorationsWidth: 0,
    lineNumbers: 'on',
    wordWrap: 'on', 
    wrappingIndent: 'deepIndent', 
  };

  const handleEditorDidMount = async (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    if (typeof window !== 'undefined') {
      const { registerLanguageSuggestions } = await import('./languageSuggestions');
      registerLanguageSuggestions(monaco);
    }
    if (onMount) {
      onMount(editor, monaco);
    }
    addMouseWheelZoom(editor, monaco);
  };

  return (
    <MonacoEditorBase
      height={height}
      language={language}
      value={value}
      path={path}
      onChange={(value) => onChange(value || "")}
      onMount={handleEditorDidMount}
      theme={theme}
      options={{
        ...defaultOptions,
        ...options,
      }}
    />
  );
}