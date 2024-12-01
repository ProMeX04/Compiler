import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

export function addDuplicateLineCommand(
  editor: Monaco.editor.IStandaloneCodeEditor,
  monaco: typeof Monaco
) {
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
    () => {
      const selection = editor.getSelection();
      const model = editor.getModel();

      if (selection && model) {
        if (selection.isEmpty()) {
          const lineNumber = selection.startLineNumber;
          const lineContent = model.getLineContent(lineNumber);
          editor.executeEdits("", [
            {
              range: new monaco.Range(lineNumber, 1, lineNumber, 1),
              text: lineContent + "\n",
            },
          ]);
          editor.setPosition({
            lineNumber: lineNumber + 1,
            column: selection.startColumn,
          });
        } else {
          const selectedText = model.getValueInRange(selection);
          editor.executeEdits("", [
            {
              range: new monaco.Range(
                selection.endLineNumber,
                selection.endColumn,
                selection.endLineNumber,
                selection.endColumn
              ),
              text: selectedText,
            },
          ]);
        }
      }
    }
  );
}

export function addMouseWheelZoom(editor: Monaco.editor.IStandaloneCodeEditor) {
  const domNode = editor.getDomNode();
  if (!domNode) return;

  domNode.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.deltaY > 0) {
          editor.trigger("mouseWheel", "editor.action.fontZoomOut", null);
        } else {
          editor.trigger("mouseWheel", "editor.action.fontZoomIn", null);
        }

        event.preventDefault();
        event.stopPropagation();
      }
    },
    { passive: false }
  );
}

export const defaultMainEditorOptions: Monaco.editor.IStandaloneEditorConstructionOptions =
  {
    fontFamily: "Cascadia Mono",
    fontSize: 14,
    lineHeight: 24,
    minimap: { enabled: false },
    smoothScrolling: true,
    scrollBeyondLastLine: true,
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      verticalSliderSize: 8,
      horizontalSliderSize: 8,
    },
    lineNumbersMinChars: 3,
    lineDecorationsWidth: 0,
    lineNumbers: "on",
    wordWrap: "on",
    wrappingIndent: "deepIndent",
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    snippetSuggestions: "inline",
    acceptSuggestionOnEnter: "off",
    tabCompletion: "on",
    wordBasedSuggestions: "allDocuments",
    suggestSelection: "first",
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
      filterGraceful: true,
      showWords: true,
      showSnippets: true,
      showInlineDetails: true,
      shareSuggestSelections: true,
      insertMode: "insert",
    },
    suggestLineHeight: 24,
  };

export const defaultInputOutputEditorOptions: Monaco.editor.IStandaloneEditorConstructionOptions =
  {
    fontFamily: "Cascadia Mono",
    fontSize: 14,
    lineHeight: 24,
    renderLineHighlight: "none",
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    minimap: { enabled: false },
    lineNumbersMinChars: 3,
    lineDecorationsWidth: 0,
    scrollbar: {
      vertical: "auto",
      horizontal: "auto",
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      verticalSliderSize: 8,
      horizontalSliderSize: 8,
    },
  };
