"use client";
import { CodeEditor } from "./components/CodeEditor";

const editorConfig = {
  defaultContent: `def solution(input):
    # Write your code here
    return input

# Test your solution
input = input()
print(solution(input))`,
  defaultLanguage: "python",
  defaultFileName: "solution",
  initialTestCases: [
    { 
      input: "1", 
      expectedOutput: "1" 
    },
    { 
      input: "2",
      expectedOutput: "2"
    }
  ],
};

export default function Main() {
  return (
    <CodeEditor {...editorConfig} />
  );
}
