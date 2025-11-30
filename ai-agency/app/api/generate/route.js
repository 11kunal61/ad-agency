import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Setup Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Parse Input
    const formData = await req.formData();
    const file = formData.get("file");
    const prompt = formData.get("prompt");

    if (!file || !prompt) {
      return NextResponse.json({ error: "Missing file or prompt" }, { status: 400 });
    }

    // 3. Prepare Image for AI
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    // 4. Ask Gemini for the Strategy
    const aiPrompt = `
      You are a marketing expert. Analyze this product image for the event: '${prompt}'.
      Return a JSON object with:
      1. "caption": A catchy Instagram caption with emojis.
      2. "hook": A short 3-word hook for a video overlay (e.g. "SALE IS LIVE").
      3. "color": A hex color code matching the product (e.g. #FF0000).
    `;

    const result = await model.generateContent([
      aiPrompt,
      { inlineData: { data: base64Data, mimeType: file.type } }
    ]);

    // 5. Clean and Parse Response
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const strategy = JSON.parse(text);

    return NextResponse.json({ success: true, data: strategy });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "AI Failed" }, { status: 500 });
  }
}