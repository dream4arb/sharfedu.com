import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

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

router.post("/api/extract-questions", async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: "Image path is required" });
    }

    const fullPath = path.join(process.cwd(), "public", imagePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(503).json({ 
        error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable." 
      });
    }

    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString("base64");

    // Use Gemini 1.5 Flash for vision tasks
    // Try gemini-1.5-flash first, fallback to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.4,
        },
      });
      console.log("Using model: gemini-1.5-flash");
    } catch (modelError: any) {
      console.warn("Failed to initialize gemini-1.5-flash, trying gemini-pro:", modelError?.message);
      model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.4,
        },
      });
      console.log("Using model: gemini-pro (fallback)");
    }

    const prompt = `أنت خبير في استخراج الأسئلة من اختبارات الرياضيات العربية.
              
قم بتحليل هذه الصورة واستخرج جميع الأسئلة بالتنسيق التالي لكل سؤال:
{
  "questions": [
    {
      "id": رقم السؤال,
      "questionText": "نص السؤال بالضبط كما هو مكتوب",
      "hasGeometricShape": true/false (هل يوجد شكل هندسي مرافق),
      "shapeDescription": "وصف دقيق للشكل الهندسي مع جميع الزوايا والأبعاد المكتوبة عليه",
      "options": {
        "a": "الخيار أ",
        "b": "الخيار ب", 
        "c": "الخيار ج",
        "d": "الخيار د"
      }
    }
  ]
}

مهم جداً:
1. انسخ النص العربي بالضبط كما هو
2. إذا كان هناك شكل هندسي، صف جميع الزوايا والأرقام المكتوبة عليه بدقة
3. استخرج جميع الأسئلة الموجودة في الصورة
4. أرجع النتيجة كـ JSON فقط بدون أي نص إضافي`;

    // Determine MIME type from file extension
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

    // Convert image to part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
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
      content = "{}";
    }
    
    // Extract JSON from response
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonContent.match(/```json\n?([\s\S]*?)\n?```/);
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
      res.json(questions);
    } catch (parseError) {
      // If JSON parsing fails, return raw content
      console.warn("Failed to parse JSON from Gemini response:", parseError);
      res.json({ raw: content });
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
