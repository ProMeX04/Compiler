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
  {
    label: "competitive",
    kind: CompletionItemKind.Snippet,
    insertText: "#include <bits/stdc++.h>\nusing namespace std;\n#define ll long long\n#define pb push_back\n#define all(x) (x).begin(),(x).end()\nconst int MOD = 1e9+7;\n\nint main() {\n    ios::sync_with_stdio(0);\n    cin.tie(0);\n    ${0}\n    return 0;\n}",
    documentation: "Competitive programming template",
  },
  {
    label: "vector",
    kind: CompletionItemKind.Snippet,
    insertText: "vector<${1:int}> ${2:v};",
    documentation: "Vector declaration",
  },
  {
    label: "sort",
    kind: CompletionItemKind.Snippet,
    insertText: "sort(${1:v}.begin(), ${1:v}.end());",
    documentation: "Sort container",
  },
  {
    label: "binary_search",
    kind: CompletionItemKind.Snippet,
    insertText: "binary_search(${1:v}.begin(), ${1:v}.end(), ${2:key});",
    documentation: "Binary search",
  },
  {
    label: "gcd",
    kind: CompletionItemKind.Snippet,
    insertText: "__gcd(${1:a}, ${2:b})",
    documentation: "Greatest Common Divisor",
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
  'virtual', 'wchar_t',
  // STL Containers
  'vector', 'stack', 'queue', 'deque', 'priority_queue', 'set', 'multiset',
  'map', 'multimap', 'unordered_set', 'unordered_map', 'pair', 'tuple',
  // STL Algorithms
  'sort', 'stable_sort', 'reverse', 'unique', 'next_permutation',
  'prev_permutation', 'lower_bound', 'upper_bound', 'binary_search',
  'max_element', 'min_element', 'accumulate', 'count', 'find',
  // Math
  'pow', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'log', 'log2', 'log10',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  // Input/Output
  'cin', 'cout', 'endl', 'setprecision', 'fixed', 'scientific',
  // Competitive Programming Terms
  'MOD', 'INF', 'MAXN', 'pb', 'll', 'vi', 'vll', 'pii', 'mp'
];