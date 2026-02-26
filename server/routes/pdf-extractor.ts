import { GoogleGenerativeAI } from "@google/generative-ai";
import { Router, Request, Response } from "express";

const router = Router();

// Lazy initialization of Gemini client - only create when needed
function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  // Initialize with v1beta API version (default)
  return new GoogleGenerativeAI(apiKey);
}

router.post("/api/extract-questions", async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(503).json({ 
        error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable." 
      });
    }

    // Use Gemini 1.5 Flash for vision tasks
    // Try gemini-1.5-flash first, fallback to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.4,
        },
      });
      console.log("Using model: gemini-1.5-flash");
    } catch (modelError: any) {
      console.warn("Failed to initialize gemini-1.5-flash, trying gemini-pro:", modelError?.message);
      model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.4,
        },
      });
      console.log("Using model: gemini-pro (fallback)");
    }

    const prompt = `أنت خبير في استخراج الأسئلة من صور الاختبارات العربية. 
قم بتحليل الصورة واستخراج جميع الأسئلة بصيغة JSON.

لكل سؤال استخرج:
- id: رقم السؤال
- question: نص السؤال
- hasImage: هل يحتوي على شكل هندسي (true/false)
- imageDescription: وصف الشكل الهندسي إن وجد
- options: الخيارات (a, b, c, d)
- type: نوع السؤال (multipleChoice أو trueFalse)

أرجع JSON فقط بدون أي نص إضافي.

استخرج جميع الأسئلة من هذه الصورة بصيغة JSON`;

    // Convert base64 to image part for Gemini
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    // Handle Gemini response format correctly
    let content = "";
    try {
      content = response.text();
    } catch (textError) {
      console.warn("Error extracting text from Gemini response:", textError);
      // Try to get candidate text directly
      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content) {
        content = candidates[0].content.parts.map((part: any) => part.text).join("");
      }
    }
    
    if (!content) {
      content = "";
    }
    
    // Extract JSON from response
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // Try to find JSON object in the response
      const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonContent = jsonObjectMatch[0];
      }
    }

    try {
      const questions = JSON.parse(jsonContent);
      res.json({ success: true, questions });
    } catch (parseError) {
      // If JSON parsing fails, return raw content
      console.warn("Failed to parse JSON from Gemini response:", parseError);
      res.json({ success: true, rawContent: content });
    }
  } catch (error: any) {
    console.error("Error extracting questions:", error);
    
    // Handle specific Gemini API errors gracefully
    if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("401")) {
      return res.status(401).json({ error: "Invalid Gemini API key" });
    }
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({ error: "Gemini API rate limit exceeded" });
    }
    if (error?.message?.includes("SAFETY")) {
      return res.status(400).json({ error: "Content was blocked by safety filters" });
    }
    
    res.status(500).json({ 
      error: "Failed to extract questions",
      message: error?.message || "Unknown error occurred"
    });
  }
});

export default router;
