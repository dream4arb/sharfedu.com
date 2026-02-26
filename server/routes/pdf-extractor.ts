import { Router, Request, Response } from "express";
import { getGeminiClient } from "../lib/gemini";

const router = Router();

router.post("/api/extract-questions", async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(503).json({ 
        error: "Gemini API key not configured." 
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.4,
      },
    });

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

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    let content = "";
    try {
      content = response.text();
    } catch {
      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content) {
        content = candidates[0].content.parts.map((part: any) => part.text).join("");
      }
    }
    
    if (!content) {
      content = "";
    }
    
    let jsonContent = content.trim();
    
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonContent = jsonObjectMatch[0];
      }
    }

    try {
      const questions = JSON.parse(jsonContent);
      res.json({ success: true, questions });
    } catch {
      res.json({ success: true, rawContent: content });
    }
  } catch (error: any) {
    console.error("Error extracting questions:", error?.message);
    
    if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("401")) {
      return res.status(401).json({ error: "Invalid Gemini API key" });
    }
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({ error: "Gemini API rate limit exceeded" });
    }
    if (error?.message?.includes("SAFETY")) {
      return res.status(400).json({ error: "Content was blocked by safety filters" });
    }
    
    res.status(500).json({ error: "Failed to extract questions" });
  }
});

export default router;
