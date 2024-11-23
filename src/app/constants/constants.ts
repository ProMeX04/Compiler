import React from 'react';
import { 
  FaJs, FaPython, FaJava, FaHtml5, FaCss3,
  FaMarkdown, FaCode, FaFileAlt
} from 'react-icons/fa';
import { 
  SiTypescript, 
  SiCplusplus, 
  SiJson,
  SiGo,
  SiRust,
  SiRuby,
  SiPhp,
  SiSwift,
  SiKotlin
} from 'react-icons/si';

export const FILE_EXTENSIONS: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  cpp: "cpp",
  c: "cpp",
  java: "java",
  txt: "plaintext",
  md: "markdown",
  json: "json",
  html: "html",
  css: "css",
  ipynb: "python",
};

export const FILE_ICONS: Record<string, JSX.Element> = {
  javascript: React.createElement(FaJs, { className: "mr-2" }),
  typescript: React.createElement(SiTypescript, { className: "mr-2" }),
  python: React.createElement(FaPython, { className: "mr-2" }),
  cpp: React.createElement(SiCplusplus, { className: "mr-2" }),
  java: React.createElement(FaJava, { className: "mr-2" }),
  html: React.createElement(FaHtml5, { className: "mr-2" }),
  css: React.createElement(FaCss3, { className: "mr-2" }),
  markdown: React.createElement(FaMarkdown, { className: "mr-2" }),
  json: React.createElement(SiJson, { className: "mr-2" }),
  plaintext: React.createElement(FaFileAlt, { className: "mr-2" }),
  default: React.createElement(FaCode, { className: "mr-2" }),
  go: React.createElement(SiGo, { className: "mr-2" }),
  rust: React.createElement(SiRust, { className: "mr-2" }),
  ruby: React.createElement(SiRuby, { className: "mr-2" }),
  php: React.createElement(SiPhp, { className: "mr-2" }),
  swift: React.createElement(SiSwift, { className: "mr-2" }),
  kotlin: React.createElement(SiKotlin, { className: "mr-2" }),
};

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  cpp: "C++",
  c: "C",
  java: "Java",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  // Add more as needed
};