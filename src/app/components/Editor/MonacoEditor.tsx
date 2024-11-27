import dynamic from "next/dynamic";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { addMouseWheelZoom } from './shortcuts';
import { registerLanguageSuggestions } from './languageSuggestions';

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
    lineNumbers: "on",
    wordWrap: "on",
    wrappingIndent: "deepIndent",
    suggestOnTriggerCharacters: true,
    quickSuggestions: { other: true, comments: true, strings: true },
    snippetSuggestions: "inline",
    acceptSuggestionOnEnter: "on",
    tabCompletion: "on",
    wordBasedSuggestions: "allDocuments",
    parameterHints: {
      enabled: true,
    },
    suggest: {
      localityBonus: true,
      snippetsPreventQuickSuggestions: false,
      showIcons: true,
      showStatusBar: true,
      preview: true,
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showDeprecated: false,
      matchOnWordStartOnly: false,
      filterGraceful: false,
      showWords: true,
      showSnippets: true,
      showInlineDetails: true,
      shareSuggestSelections: true,
      selectionMode: 'never',
      insertMode: 'insert'
    },
    suggestSelection: 'first',
    suggestLineHeight: 24,
  };

  const handleEditorDidMount = async (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    if (onMount) {
      onMount(editor, monaco);
    }
    
    addMouseWheelZoom(editor);
    
    if (typeof window !== 'undefined' && !suggestionsRegistered) {
      registerLanguageSuggestions(monaco);
      suggestionsRegistered = true;
    }
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