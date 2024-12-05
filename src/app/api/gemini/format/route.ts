import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { code, language }: { code: string; language: string } =
      await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const prompt = `You are a code formatting assistant. Your task is to format and beautify the following ${language} code.

Rules:
- Maintain consistent indentation
- Add appropriate spacing around operators and blocks
- Remove unnecessary whitespace and blank lines 
- Use appropriate line breaks between logical sections
- Apply language-specific style conventions for ${language}
- Keep variable/function names exactly as they are
- Maintain all comments and docstrings
- Do not change any functionality or logic
- Return only the formatted code without any explanations
- No code block markers
- No additional comments

Here's the code to format:
${code}`;

    const result = await model.generateContent(prompt);
    let formattedCode = result.response.text();
    formattedCode = formattedCode.replace(/```[a-z]*\n/g, "");
    formattedCode = formattedCode.replace(/\n```/g, "");

    return NextResponse.json({ formattedCode });
  } catch {
    return NextResponse.error();
  }
}
