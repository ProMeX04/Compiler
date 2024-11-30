import { languages } from "monaco-editor";
const { CompletionItemKind } = languages;

export const pythonSuggestions = [
  {
    label: "def",
    kind: CompletionItemKind.Snippet,
    insertText: "def ${1:function_name}(${2:parameters}):\n\t${0:pass}",
    documentation: "Define a new function",
  },
];

export const pythonKeywords = [
  'and', 'as', 'assert', 'async', 'await', 'break', 'continue', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
  'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
  'while', 'with', 'yield', 'True', 'False', 'None'
];
