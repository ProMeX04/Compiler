import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

    const prompt = `Format the following ${language} code for better readability. Only apply formatting changes (indentation, spacing, line breaks) without modifying any actual code. Do not add, remove, or change any code functionality. Here's the code:

${code}`;

    const result = await model.generateContent(prompt);
    let formattedCode = result.response.text();

    // Clean the response by removing markdown code blocks with language identifiers and extra whitespace
    // xử   lý nó vẫn còn 3 dấu gạch ``` ở cuối
    formattedCode = formattedCode.replace(/```[a-z]*\n/g, "");
    formattedCode = formattedCode.replace(/\n```/g, "");

    return NextResponse.json({ formattedCode });
  } catch {
    return NextResponse.error();
  }
}
