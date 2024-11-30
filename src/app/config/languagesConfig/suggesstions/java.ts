import { languages } from "monaco-editor";
const { CompletionItemKind } = languages;

export const javaSuggestions = [
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

export const javaKeywords = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import',
  'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private',
  'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super',
  'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try',
  'void', 'volatile', 'while', 'nextInt()', 'nextLine()', 'nextFloat()', 'nextDouble()'
];