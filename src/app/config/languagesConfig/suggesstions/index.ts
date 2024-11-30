import { pythonSuggestions, pythonKeywords } from './python';
import { javaSuggestions, javaKeywords } from './java';
import { cppSuggestions, cppKeywords } from './cpp';

export function registerLanguageSuggestions(monaco: typeof import("monaco-editor")) {
  if (typeof window === "undefined") return;

  const { languages } = monaco;
  const { CompletionItemKind, CompletionItemInsertTextRule } = languages;

  const languagesSuggestions = {
    python: pythonSuggestions,
    java: javaSuggestions,
    cpp: cppSuggestions,
  };

  const languageKeywords = {
    python: pythonKeywords,
    java: javaKeywords,
    cpp: cppKeywords,
  };

  // Keep track of registered languages
  const registeredLanguages = new Set<string>();

  Object.entries(languagesSuggestions).forEach(([language, suggestions]) => {
    if (registeredLanguages.has(language)) return;
    
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

        // Filter các từ dựa trên từ đang gõ
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
