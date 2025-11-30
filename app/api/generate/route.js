import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const prompt = data.get("prompt");
    
    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    // AI Logic
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const bytes = await file.arrayBuffer();
    const b64 = Buffer.from(bytes).toString("base64");
    
    const result = await model.generateContent([
      `Analyze this image for event '${prompt}'. Return JSON: { "caption": "...", "hook": "...", "color": "#HEX" }`,
      { inlineData: { data: b64, mimeType: file.type } }
    ]);

    const jsonText = result.response.text().replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(jsonText));
    
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}