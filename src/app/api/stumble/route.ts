import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are the ultimate internet serendipity engine (like the old StumbleUpon). The user wants to discover something obscure, fascinating, and mind-blowing about: ${topic}. Return ONLY a JSON object with no markdown formatting: {"title": "The Name of the Concept/Website/Event", "hook": "One mind-blowing sentence that hooks the reader.", "deepDive": "A 2-3 sentence fascinating explanation.", "searchQuery": "The exact Google search term to explore this rabbit hole."}`,
            },
          ],
        },
      ],
    });

    const text = result.response.text();

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      const data = JSON.parse(cleaned);
      return Response.json(data);
    } catch (parseErr) {
      console.error("JSON Parse Error:", cleaned);
      return Response.json({ error: "Failed to parse AI response into JSON" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("API Route Error:", err);
    return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
