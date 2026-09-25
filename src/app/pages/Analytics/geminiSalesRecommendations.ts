import type { SalesDecisionInsight } from "./useSalesDecisionInsights";

export async function generateRecommendations(insights: SalesDecisionInsight[]): Promise<SalesDecisionInsight[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini browser key is not configured");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: `Rewrite only the recommendation field for each sales decision card. Make it concise, plain-English business guidance tied to the card's stated period and baseline. Do not add facts or use technical terms. Return a strict JSON array matching each id and recommendation, with no markdown. Data: ${JSON.stringify(insights)}` }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 400 } }),
  });
  if (!response.ok) throw new Error("Gemini recommendation request failed");
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no recommendations");
  const generated = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "")) as Array<Pick<SalesDecisionInsight, "id" | "recommendation">>;
  if (!Array.isArray(generated) || generated.length !== insights.length) throw new Error("Invalid Gemini response");
  return insights.map(insight => {
    const match = generated.find(item => item.id === insight.id);
    if (!match || typeof match.recommendation !== "string" || !match.recommendation.trim()) throw new Error("Incomplete Gemini response");
    return { ...insight, recommendation: match.recommendation.trim().slice(0, 280) };
  });
}
