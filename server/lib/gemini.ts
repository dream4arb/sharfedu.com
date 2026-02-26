import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[Gemini] GEMINI_API_KEY is not set");
    return null;
  }

  try {
    cachedClient = new GoogleGenerativeAI(apiKey);
    return cachedClient;
  } catch (error: any) {
    console.error("[Gemini] Failed to initialize:", error?.message);
    return null;
  }
}

export function getGeminiModel(client: GoogleGenerativeAI, options?: { maxOutputTokens?: number; temperature?: number }) {
  return client.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: options?.maxOutputTokens ?? 1000,
      temperature: options?.temperature ?? 0.7,
    },
  });
}
