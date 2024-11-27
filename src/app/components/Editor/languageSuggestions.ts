export function registerLanguageSuggestions(
  monaco: typeof import("monaco-editor")
) {
  if (typeof window === "undefined") return;

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
    {
      label: "Scanner",
      kind: CompletionItemKind.Snippet,
      insertText: "Scanner ${1:scanner} = new Scanner(System.in);",
      documentation: "Create a new Scanner instance",
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

  // Thêm keywords cho mỗi ngôn ngữ
  const languageKeywords = {
    python: [
      'and', 'as', 'assert', 'async', 'await', 'break', 'continue', 'del', 'elif',
      'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
      'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
      'while', 'with', 'yield', 'True', 'False', 'None'
    ],
    java: [
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
      'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
      'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import',
      'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private',
      'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super',
      'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try',
      'void', 'volatile', 'while', 'nextInt()', 'nextLine()', 'nextFloat()', 'nextDouble()'
    ],
    cpp: [
      'auto', 'break', 'string','case', 'char', 'const', 'continue', 'default', 'do',
      'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int',
      'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
      'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
      'inline', 'bool', 'catch', 'class', 'const_cast', 'delete', 'dynamic_cast',
      'explicit', 'false', 'friend', 'mutable', 'namespace', 'new', 'operator',
      'private', 'protected', 'public', 'reinterpret_cast', 'static_cast',
      'template', 'this', 'throw', 'true', 'try', 'typeid', 'typename', 'using',
      'virtual', 'wchar_t'
    ]
  };

  // Keep track of registered languages
  const registeredLanguages = new Set<string>();

  Object.entries(languagesSuggestions).forEach(([language, suggestions]) => {
    if (registeredLanguages.has(language)) {
      // Skip if providers are already registered for this language
      return;
    }

    // Mark the language as registered
    registeredLanguages.add(language);

    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', '"', "'", '`', '/', '@', '<', ' '],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Lấy keywords của ngôn ngữ
        const keywords = languageKeywords[language as keyof typeof languageKeywords] || [];
        
        // Lấy words từ document và lọc bỏ keywords
        const wordRegex = /[a-zA-Z]\w*/g;
        const text = model.getValue();
        const words = [...new Set(text.match(wordRegex) || [])]
          .filter(word => !keywords.includes(word));

        // Filter các từ d���a trên từ đang gõ
        const currentWord = word.word.toLowerCase();
        
        // Giới hạn số lượng mỗi loại suggestion
        const maxSuggestionsPerType = 3;
        
        // Lọc và giới hạn số lượng
        const filteredKeywords = keywords
          .filter(k => k.toLowerCase().startsWith(currentWord))
          .slice(0, maxSuggestionsPerType);
          
        const filteredSnippets = currentWord 
          ? suggestions
              .filter(s => s.label.toLowerCase().startsWith(currentWord))
              .slice(0, maxSuggestionsPerType)
          : [];
          
        const filteredWords = words
          .filter(w => w.toLowerCase().startsWith(currentWord))
          .slice(0, maxSuggestionsPerType);

        return {
          suggestions: [
            ...filteredKeywords.map(keyword => ({
              label: keyword,
              kind: CompletionItemKind.Keyword,
              insertText: keyword,
              range,
              sortText: '0' + keyword,
            })),
            ...filteredSnippets.map((suggestion) => ({
              ...suggestion,
              insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              sortText: '1' + suggestion.label,
            })),
            ...filteredWords.map(word => ({
              label: word,
              kind: CompletionItemKind.Text,
              insertText: word,
              range,
              sortText: '2' + word,
            }))
          ]
        };
      }
    });
  });
}
