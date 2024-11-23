
export const themes = {
  dark: {
    name: 'vs-dark',
    bg: 'bg-[#1e1e1e]',
    tabBg: 'bg-[#2d2d2d]',
    text: 'text-white',
    textMuted: 'text-zinc-400',
    border: 'border-zinc-800',
    hover: 'hover:bg-[#2d2d2d]',
    statusBarBg: 'bg-zinc-900',
    panelBg: 'bg-zinc-800'
  },
  light: {
    name: 'vs-light',
    bg: 'bg-[#ffffff]',
    tabBg: 'bg-[#f3f3f3]',
    text: 'text-zinc-900',
    textMuted: 'text-zinc-600',
    border: 'border-zinc-200',
    hover: 'hover:bg-[#f3f3f3]',
    statusBarBg: 'bg-zinc-100',
    panelBg: 'bg-zinc-50'
  }
};

export const defaultLanguages = {
  python: {
    name: "python",
    defaultExt: "py",
    defaultContent: "# Write your Python code here\n"
  },
  javascript: {
    name: "javascript",
    defaultExt: "js",
    defaultContent: "// Write your JavaScript code here\n"
  },
  typescript: {
    name: "typescript",
    defaultExt: "ts",
    defaultContent: "// Write your TypeScript code here\n"
  },
  cpp: {
    name: "cpp",
    defaultExt: "cpp",
    defaultContent: "#include <iostream>\n\nint main() {\n    \n    return 0;\n}"
  }
};