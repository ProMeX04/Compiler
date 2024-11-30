import { languages } from "monaco-editor";
const { CompletionItemKind } = languages;

export const cppSuggestions = [
  {
    label: "include",
    kind: CompletionItemKind.Snippet,
    insertText: "include <iostream>\nusing namespace std;\nint main() {\n    ${0}\n}",
    documentation: "Main function",
  },
  {
    label: "for",
    kind: CompletionItemKind.Snippet,
    insertText:
      "for (int ${1:i} = 0; ${1:i} < ${2:N}; ++${1:i}) {\n    ${0:/* code */}\n}",
    documentation: "For loop",
  },
  {
    label: "if",
    kind: CompletionItemKind.Snippet,
    insertText: "if (${1:condition}) {\n    ${0:/* code */}\n}",
    documentation: "If statement",
  },
  {
    label: "while",
    kind: CompletionItemKind.Snippet,
    insertText: "while (${1:condition}) {\n    ${0:/* code */}\n}",
    documentation: "While loop",
  },
  {
    label: "class",
    kind: CompletionItemKind.Snippet,
    insertText:
      "class ${1:ClassName} {\npublic:\n    ${1:ClassName}();\n    ~${1:ClassName}();\n\nprivate:\n    ${0:/* data members */}\n};",
    documentation: "Class definition",
  },
  {
    label: "cout",
    kind: CompletionItemKind.Snippet,
    insertText: "cout << ${1:/* message */} << endl;",
    documentation: "Print to console",
  },
];

export const cppKeywords = [
  'auto', 'break', 'string', 'case', 'char', 'const', 'continue', 'default', 'do',
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int',
  'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
  'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
  'inline', 'bool', 'catch', 'class', 'const_cast', 'delete', 'dynamic_cast',
  'explicit', 'false', 'friend', 'mutable', 'namespace', 'new', 'operator',
  'private', 'protected', 'public', 'reinterpret_cast', 'static_cast',
  'template', 'this', 'throw', 'true', 'try', 'typeid', 'typename', 'using',
  'virtual', 'wchar_t'
];