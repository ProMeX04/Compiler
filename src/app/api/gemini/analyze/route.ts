import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { code, language }: { code: string; language: string } =
      await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "") 
      .replace(/^\s*$(?:\r\n?|\n)/gm, ""); 
    const commentSyntax =
      {
        javascript: "//",
        typescript: "//",
        python: "#",
        ruby: "#",
        php: "//",
        java: "//",
        "c++": "//",
        "c#": "//",
        go: "//",
        rust: "//",
        lua: "--",
        sql: "--",
        r: "#",
        matlab: "%",
        perl: "#",
      }[language.toLowerCase()] || "//";

    const prompt = `You are a code reviewer. Your task is to analyze the following ${language} code for both syntax errors and potential improvements.

Rules:
- Do not modify or reformat the original code
- Use Vietnamese comments with ${commentSyntax} above any problematic lines
- For syntax errors, start comment with "[Lỗi cú pháp]:" followed by explanation
- For improvements, start comment with "[Gợi ý]:" followed by suggestion
- Comments must be in Vietnamese
- Use the correct comment syntax for ${language}: ${commentSyntax}
- Focus on actual syntax errors like missing semicolons, wrong brackets, undefined variables
- Also suggest code improvements and better practices
- Keep the original code exactly as is
- No explanations outside the code
- No code block markers
- Return the original code with only added Vietnamese comments

Here's the code to review:
${cleanCode}`;

    const result = await model.generateContent(prompt);
    let formattedCode = result.response.text();
    formattedCode = formattedCode.replace(/```[a-z]*\n/g, "");
    formattedCode = formattedCode.replace(/\n```/g, "");

    return NextResponse.json({ formattedCode });
  } catch {
    return NextResponse.error();
  }
}
