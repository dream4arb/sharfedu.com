import { Router } from "express";
import { getGeminiClient } from "../lib/gemini";
import { access, readFile } from "fs/promises";
import path from "path";

const router = Router();

interface ExtractedQuestion {
  id: number;
  questionText: string;
  hasGeometricShape: boolean;
  shapeDescription?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer?: string;
}

router.post("/api/extract-questions-from-file", async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: "Image path is required" });
    }

    const safePath = path.basename(imagePath);
    const fullPath = path.join(process.cwd(), "public", safePath);
    
    try { await access(fullPath); } catch {
      return res.status(404).json({ error: "Image not found" });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(503).json({ error: "Gemini API not configured" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.3,
      },
    });

    const imageBuffer = await readFile(fullPath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = fullPath.endsWith(".png") ? "image/png" : "image/jpeg";

    const prompt = `حلل هذه الصورة واستخرج جميع الأسئلة. أرجع النتيجة بصيغة JSON فقط.

لكل سؤال:
- id: رقم السؤال
- questionText: نص السؤال كاملاً
- hasGeometricShape: هل يوجد شكل هندسي (true/false)
- shapeDescription: وصف الشكل إن وجد
- options: { a, b, c, d }
- correctAnswer: الإجابة الصحيحة إن كانت محددة

أرجع مصفوفة JSON فقط بدون أي نص إضافي.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ]);

    const response = result.response;
    let content = response.text();

    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) content = jsonMatch[1];

    const questions: ExtractedQuestion[] = JSON.parse(content);
    res.json({ success: true, questions });
  } catch (error: any) {
    console.error("Extract questions error:", error?.message);
    res.status(500).json({ error: "Failed to extract questions" });
  }
});

export default router;
