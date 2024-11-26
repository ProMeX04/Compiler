export function registerLanguageSuggestions(
  monaco: typeof import("monaco-editor")
) {
  if (typeof window === "undefined") {
    // Do not register suggestions during SSR
    return;
  }

  const { languages } = monaco;
  const { CompletionItemKind, CompletionItemInsertTextRule } = languages;

  const pythonSuggestions = [
    {
      label: "def",
      kind: CompletionItemKind.Snippet,
      insertText: "def ${1:function_name}(${2:parameters}):\n\t${0:pass}",
      documentation: "Define a new function",
    },
    {
      label: "class",
      kind: CompletionItemKind.Snippet,
      insertText: "class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${0:pass}",
      documentation: "Create a new class",
    },
    {
      label: "if",
      kind: CompletionItemKind.Snippet,
      insertText: "if ${1:condition}:\n\t${0:pass}",
      documentation: "If statement",
    },
    {
      label: "for",
      kind: CompletionItemKind.Snippet,
      insertText: "for ${1:item} in ${2:items}:\n\t${0:pass}",
      documentation: "For loop",
    },
  ];


  const javaSuggestions = [
    {
      label: "class",
      kind: CompletionItemKind.Snippet,
      insertText: "public class ${1:ClassName} {\n\t${0}\n}",
      documentation: "Create a new class",
    },
    {
      label: "psvm",
      kind: CompletionItemKind.Snippet,
      insertText: "public static void main(String[] args) {\n\t${0}\n}",
      documentation: "Main method",
    },
    {
      label: "sout",
      kind: CompletionItemKind.Snippet,
      insertText: "System.out.println(${0});",
      documentation: "Print to console",
    },
    {
      label: "for",
      kind: CompletionItemKind.Snippet,
      insertText: "for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {\n\t${0}\n}",
      documentation: "For loop",
    },
    {
      label: "if",
      kind: CompletionItemKind.Snippet,
      insertText: "if (${1:condition}) {\n\t${0}\n}",
      documentation: "If statement",
    },
    {
      label: "while",
      kind: CompletionItemKind.Snippet,
      insertText: "while (${1:condition}) {\n\t${0}\n}",
      documentation: "While loop",
    },
    {
      label: "trycatch",
      kind: CompletionItemKind.Snippet,
      insertText: "try {\n\t${0}\n} catch (${1:Exception e}) {\n\t${2}\n}",
      documentation: "Try-catch block",
    },
  ];

  const cppSuggestions = [
    {
      label: "include",
      kind: CompletionItemKind.Snippet,
      insertText:
        "include <iostream>\nusing namespace std;\nint main() {\n    ${0}\n}",
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

  const languagesSuggestions = {
    python: pythonSuggestions,
    java: javaSuggestions,
    cpp: cppSuggestions,
  };

  Object.entries(languagesSuggestions).forEach(([language, suggestions]) => {
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          })),
        };
      },
    });
  });
}
