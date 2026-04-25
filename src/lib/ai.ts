import Groq from "groq-sdk";
import { z } from "zod";

const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  return new Groq({ apiKey });
}

/**
 * Extract JSON from LLM output
 */
function extractJson(raw: string): string {
  // 1. Try ```json fenced block
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  // 2. Try any fenced block
  const anyFence = raw.match(/```\s*([\s\S]*?)```/);
  if (anyFence?.[1]) {
    return anyFence[1].trim();
  }

  // 3. Try first {...} block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return raw.slice(start, end + 1);
  }

  throw new Error("No JSON object found in AI response");
}

/**
 * Try to repair common JSON mistakes from LLM
 */
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    console.warn("Initial JSON parse failed. Attempting repair...");

    // Common fixes
    const fixed = text
      .replace(/,\s*}/g, "}") // trailing commas
      .replace(/,\s*]/g, "]")
      .replace(/"\s*"/g, '","') // missing commas between strings
      .replace(/\n/g, " ")
      .replace(/\t/g, " ");

    try {
      return JSON.parse(fixed);
    } catch {
      console.error("❌ FINAL JSON PARSE FAILED");
      console.error("Raw text:", text);
      throw new Error("AI returned invalid JSON");
    }
  }
}

export async function generateStructuredJson<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON API. Return ONLY valid JSON. No explanation, no markdown, no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  console.log("🧠 RAW AI RESPONSE:\n", content);

  const jsonText = extractJson(content);

  const parsed = safeJsonParse(jsonText);

  return schema.parse(parsed);
}