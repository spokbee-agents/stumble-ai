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
              text: `You are the ultimate internet serendipity engine (like the old StumbleUpon). The user wants to discover something obscure, fascinating, and mind-blowing about: ${topic}. Return ONLY a JSON object with no markdown formatting: {"title": "Name", "hook": "Mind-blowing sentence", "deepDive": "2-3 paragraphs of fascinating explanation", "websiteUrl": "A specific, real, cool website URL to explore this (e.g., an archive, museum, interactive site, or official page)", "wikipediaTopic": "The exact Wikipedia article title related to this (e.g., 'Antikythera_mechanism')"}`,
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

      // Fetch Wikipedia image
      if (data.wikipediaTopic) {
        try {
          const wikiRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.wikipediaTopic)}`
          );
          const wikiData = await wikiRes.json();
          data.imageUrl = wikiData.thumbnail?.source || null;
        } catch {
          data.imageUrl = null;
        }
      }

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
