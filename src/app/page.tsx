"use client";
import { CodeEditor } from "./components/CodeEditor";

const editorConfig = {
  defaultLanguage: "cpp",
  defaultFileName: "solution",
  templateCodes: {
    cpp: `#include<iostream>
using namespace std;
int main () {
    
}`,
    python: `def main():
    # your code here 1
    pass

if __name__ == "__main__":
    main()`,
    java: `public class solution {
    public static void main(String[] args) {
        
    }
}`,
  },
  initialTestCases: [
    {
      input: "1",
      expectedOutput: "1",
    },
    {
      input: "2",
      expectedOutput: "2",
    },
  ],
};

export default function Main() {
  return <CodeEditor {...editorConfig} />;
}
