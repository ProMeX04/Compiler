import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_AI_STUDIO_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { message, code, language } = await request.json();
    console.log("Received request:", { message, language }); // Debug log

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

    const prompt = `As a code analysis expert, please explain the specified part:

Rules:
- ONLY add comments for code related to the question
- DO NOT comment unrelated code parts
- Write comments in Vietnamese, keep them concise and clear
- Place comments right before the code that needs explanation
- Use // for short comments
- Use /* ... */ for detailed comments
- MUST return the entire original code
- DO NOT modify the original code

Here is the ${language} code to explain:
${code}

Question: ${message}

Return the complete code with Vietnamese comments explaining the asked part:`;

    const result = await model.generateContent(prompt);
    let formattedCode = result.response.text();
    formattedCode = formattedCode.replace(/```[a-z]*\n/g, "");
    formattedCode = formattedCode.replace(/\n```/g, "");
    if (!formattedCode) {
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ formattedCode });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}