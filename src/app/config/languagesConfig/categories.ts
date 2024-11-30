import React from 'react';
import {
  FaJs, FaPython, FaJava, FaCode, FaPhp,
} from "react-icons/fa";
import {
  SiTypescript,
  SiCplusplus,
  SiGo,
  SiRust,
  SiRuby,
  SiSwift,
  SiKotlin,
  SiCsharp,
  SiScala,
  SiC,
  SiHaskell,
  SiLua,
  SiR
} from "react-icons/si";

export interface LanguageConfig {
  name: string;           
  displayName: string;    
  extension: string;     
  icon: React.ReactNode; 
  defaultContent: string;
  aliases?: string[];    
}

export const LANGUAGE_CONFIGS: { [key: string]: LanguageConfig } = {
  cpp: {
    name: "cpp",
    displayName: "C++",
    extension: "cpp",
    icon: React.createElement(SiCplusplus, { className: "mr-2", style: { color: '#00599C' } }),
    defaultContent: "#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    aliases: ["c++", "cpp", "g++"]
  },
  c: {
    name: "c",
    displayName: "C",
    extension: "c",
    icon: React.createElement(SiC, { className: "mr-2", style: { color: '#A8B9CC' } }),
    defaultContent: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
  },
  python: {
    name: "python",
    displayName: "Python",
    extension: "py",
    icon: React.createElement(FaPython, { className: "mr-2", style: { color: '#3776AB' } }),
    defaultContent: "def solution():\n    # Write your code here\n    pass\n",
    aliases: ["python3", "py", "python"]
  },
  javascript: {
    name: "javascript",
    displayName: "JavaScript",
    extension: "js",
    icon: React.createElement(FaJs, { className: "mr-2", style: { color: '#F7DF1E' } }),
    defaultContent: "function solution() {\n    // Write your code here\n}\n",
    aliases: ["node", "nodejs", "js"]
  },
  typescript: {
    name: "typescript",
    displayName: "TypeScript",
    extension: "ts",
    icon: React.createElement(SiTypescript, { className: "mr-2", style: { color: '#3178C6' } }),
    defaultContent: "function solution(): void {\n    // Write your code here\n}\n",
  },
  java: {
    name: "java",
    displayName: "Java",
    extension: "java",
    icon: React.createElement(FaJava, { className: "mr-2", style: { color: '#007396' } }),
    defaultContent: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
    aliases: ["java", "openjdk"]
  },
  csharp: {
    name: "csharp",
    displayName: "C#",
    extension: "cs",
    icon: React.createElement(SiCsharp, { className: "mr-2", style: { color: '#239120' } }),
    defaultContent: "using System;\n\nclass Program {\n    static void Main() {\n        // Write your code here\n    }\n}",
    aliases: ["c#", "cs", "dotnet", "csharp"]
  },
  go: {
    name: "go",
    displayName: "Go",
    extension: "go",
    icon: React.createElement(SiGo, { className: "mr-2", style: { color: '#00ADD8' } }),
    defaultContent: "package main\n\nfunc main() {\n    // Write your code here\n}",
    aliases: ["golang"]
  },
  rust: {
    name: "rust",
    displayName: "Rust",
    extension: "rs",
    icon: React.createElement(SiRust, { className: "mr-2", style: { color: '#000000' } }),
    defaultContent: "fn main() {\n    // Write your code here\n}",
  },
  ruby: {
    name: "ruby",
    displayName: "Ruby",
    extension: "rb",
    icon: React.createElement(SiRuby, { className: "mr-2", style: { color: '#CC342D' } }),
    defaultContent: "def solution\n    # Write your code here\nend",
  },
  php: {
    name: "php",
    displayName: "PHP",
    extension: "php",
    icon: React.createElement(FaPhp, { className: "mr-2", style: { color: '#777BB4' } }),
    defaultContent: "<?php\n\nfunction solution() {\n    // Write your code here\n}\n",
  },
  swift: {
    name: "swift",
    displayName: "Swift",
    extension: "swift",
    icon: React.createElement(SiSwift, { className: "mr-2", style: { color: '#FA7343' } }),
    defaultContent: "func solution() {\n    // Write your code here\n}",
  },
  kotlin: {
    name: "kotlin",
    displayName: "Kotlin",
    extension: "kt",
    icon: React.createElement(SiKotlin, { className: "mr-2", style: { color: '#7F52FF' } }),
    defaultContent: "fun main() {\n    // Write your code here\n}",
  },
  scala: {
    name: "scala",
    displayName: "Scala",
    extension: "scala",
    icon: React.createElement(SiScala, { className: "mr-2", style: { color: '#DC322F' } }),
    defaultContent: "object Main extends App {\n    // Write your code here\n}",
  },
  haskell: {
    name: "haskell",
    displayName: "Haskell",
    extension: "hs",
    icon: React.createElement(SiHaskell, { className: "mr-2", style: { color: '#5D4F85' } }),
    defaultContent: "main :: IO ()\nmain = do\n    -- Write your code here",
  },
  lua: {
    name: "lua",
    displayName: "Lua",
    extension: "lua",
    icon: React.createElement(SiLua, { className: "mr-2", style: { color: '#2C2D72' } }),
    defaultContent: "function solution()\n    -- Write your code here\nend",
  },
  r: {
    name: "r",
    displayName: "R",
    extension: "r",
    icon: React.createElement(SiR, { className: "mr-2", style: { color: '#276DC3' } }),
    defaultContent: "solution <- function() {\n    # Write your code here\n}",
  }
};

// Helper functions
export function getLanguageByName(name: string): LanguageConfig {
  return LANGUAGE_CONFIGS[name] || LANGUAGE_CONFIGS["python"]; // Default to Python
}

export function getLanguageIcon(language: string): React.ReactNode {
  return LANGUAGE_CONFIGS[language]?.icon || React.createElement(FaCode, { className: "mr-2" });
}

export function getLanguageExtension(language: string): string {
  return LANGUAGE_CONFIGS[language]?.extension || "txt";
}

export function getDefaultContent(language: string): string {
  return LANGUAGE_CONFIGS[language]?.defaultContent || "";
}