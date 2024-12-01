
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

export function addMoveLineCommands(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
  // Move line up
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
    () => {
      const selection = editor.getSelection();
      if (!selection) return;
      
      const lineNumber = selection.startLineNumber;
      if (lineNumber <= 1) return;

      editor.executeEdits('', [{
        range: new monaco.Range(lineNumber - 1, 1, lineNumber, 1),
        text: editor.getModel()?.getLineContent(lineNumber) + '\n'
      }, {
        range: new monaco.Range(lineNumber, 1, lineNumber + 1, 1),
        text: editor.getModel()?.getLineContent(lineNumber - 1) + '\n'
      }]);
      
      editor.setSelection(new monaco.Selection(
        lineNumber - 1,
        selection.startColumn,
        lineNumber - 1,
        selection.endColumn
      ));
    }
  );

  // Move line down
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
    () => {
      const selection = editor.getSelection();
      if (!selection) return;
      
      const lineNumber = selection.startLineNumber;
      const lastLineNumber = editor.getModel()?.getLineCount() || 0;
      if (lineNumber >= lastLineNumber) return;

      editor.executeEdits('', [{
        range: new monaco.Range(lineNumber, 1, lineNumber + 1, 1),
        text: editor.getModel()?.getLineContent(lineNumber + 1) + '\n'
      }, {
        range: new monaco.Range(lineNumber + 1, 1, lineNumber + 2, 1),
        text: editor.getModel()?.getLineContent(lineNumber) + '\n'
      }]);
      
      editor.setSelection(new monaco.Selection(
        lineNumber + 1,
        selection.startColumn,
        lineNumber + 1,
        selection.endColumn
      ));
    }
  );
}