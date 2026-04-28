import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(request: Request) {
  const { topic } = await request.json();

  if (!topic || typeof topic !== "string") {
    return Response.json({ error: "Topic is required" }, { status: 400 });
  }

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

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const data = JSON.parse(cleaned);

  return Response.json(data);
}
