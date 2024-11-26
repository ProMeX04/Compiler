import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

export function addDuplicateLineCommand(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
    () => {
      const selection = editor.getSelection();
      const model = editor.getModel();

      if (selection && model) {
        if (selection.isEmpty()) {
          const lineNumber = selection.startLineNumber;
          const lineContent = model.getLineContent(lineNumber);
          editor.executeEdits("", [{
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            text: lineContent + "\n",
          }]);
          editor.setPosition({
            lineNumber: lineNumber + 1,
            column: selection.startColumn,
          });
        } else {
          const selectedText = model.getValueInRange(selection);
          editor.executeEdits("", [{
            range: new monaco.Range(
              selection.endLineNumber,
              selection.endColumn,
              selection.endLineNumber,
              selection.endColumn
            ),
            text: selectedText,
          }]);
        }
      }
    }
  );
}

export function addMouseWheelZoom(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
  const domNode = editor.getDomNode();
  if (!domNode) return;

  domNode.addEventListener('wheel', (event) => {
    if (event.ctrlKey || event.metaKey) {
      const delta = event.deltaY > 0 ? -1 : 1;
      const currentFontSize = editor.getOption(monaco.editor.EditorOption.fontSize);
      const newFontSize = Math.max(8, Math.min(32, currentFontSize + delta));
      const newLineHeight = newFontSize * 1.5; // Adjust line height proportionally
      
      editor.updateOptions({
        fontSize: newFontSize,
        lineHeight: newLineHeight
      });

      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive: false });
}
