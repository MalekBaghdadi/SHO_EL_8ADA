import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { localIntent } from "@/lib/localIntent";

// Available tags from the food system
const AVAILABLE_TAGS = [
  "ra7a",      // comfort
  "se7i",      // healthy
  "khafeef",   // light
  "shab3an",   // filling
  "sare3",     // quick
  "mashhour",  // popular
  "ta2lidi",   // traditional
  "te2il",     // heavy
  "taza",      // fresh
  "7elw",      // sweet
];

// Available food categories for exclusions
const AVAILABLE_CATEGORIES = ["breakfast", "main", "snack", "dessert"];

export async function POST(request: NextRequest) {
  let text = "";
  try {
    const body = await request.json();
    text = body.text || "";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { tags: [], exclude: [] },
        { status: 200 }
      );
    }

    // 1. ALWAYS compute localTags first (MANDATORY)
    const localTags = localIntent(text);
    console.log("Local tags:", localTags);

    let aiTags: string[] = [];
    let aiExclude: string[] = [];

    // 2. Try calling Gemini inside try/catch (optional)
    try {
      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try multiple model names as fallback (some may be deprecated or unavailable)
        const modelNames = [
          "gemini-2.5-flash",  // This works! Verified via curl
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash",
          "gemini-pro",
          "gemini-1.5-pro",
        ];

        const prompt = `You are a food intent parser for a Lebanese food suggestion app. Extract tags from user input.

AVAILABLE TAGS (use ONLY these exact string values):
- "ra7a" = comfort food, relaxing, cozy
- "se7i" = healthy, diet, light eating  
- "khafeef" = light, not heavy, easy on stomach
- "shab3an" = filling, satisfying, hearty
- "sare3" = quick, fast, on-the-go
- "mashhour" = popular, famous, well-known
- "ta2lidi" = traditional, classic, authentic
- "te2il" = heavy, rich, filling
- "taza" = fresh, new, crisp
- "7elw" = sweet, dessert, sugary

CATEGORIES FOR EXCLUSIONS:
- "breakfast", "main", "snack", "dessert"

INPUT: "${text}"

Return ONLY this JSON format:
{"tags": ["tag1", "tag2"], "exclude": []}

If uncertain, return {"tags": [], "exclude": []}.

JSON response:`;

        // Try each model until one works
        let responseText = "";
        let modelWorked = false;
        
        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Add timeout to prevent hanging (5 seconds)
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("Gemini API timeout")), 5000)
            );
            
            const result = await Promise.race([
              model.generateContent(prompt),
              timeoutPromise
            ]) as any;
            
            responseText = result.response.text().trim();
            modelWorked = true;
            console.log(`Successfully used model: ${modelName}`);
            break; // Success, exit loop
          } catch (modelError: any) {
            // If 404, try next model; if other error (429, timeout, etc.), break and fallback
            if (modelError?.status === 404) {
              console.log(`Model ${modelName} not found (404), trying next...`);
              continue;
            } else {
              // Rate limit, timeout, or other error - don't try other models
              throw modelError;
            }
          }
        }
        
        if (!modelWorked) {
          throw new Error("No available Gemini model found (all returned 404)");
        }

        // Try to extract JSON from response
        try {
          const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const intent = JSON.parse(cleaned);

          // Validate and sanitize the response
          aiTags = Array.isArray(intent.tags)
            ? intent.tags.filter((tag: string) => AVAILABLE_TAGS.includes(tag))
            : [];

          aiExclude = Array.isArray(intent.exclude)
            ? intent.exclude.filter((cat: string) => AVAILABLE_CATEGORIES.includes(cat))
            : [];
        } catch (parseError) {
          // Swallow parse error, aiTags stays empty
          console.error("Failed to parse AI response:", parseError);
        }
      }
    } catch (error: any) {
      // Swallow all AI errors (rate limits, timeouts, etc.)
      const errorMsg = error?.message || String(error);
      const errorStatus = error?.status;
      
      if (errorStatus === 429) {
        console.error("AI API rate limit (429) - using local tags:", errorMsg);
      } else if (errorStatus === 404) {
        console.error("AI API model not found (404) - using local tags:", errorMsg);
      } else if (errorMsg.includes("timeout")) {
        console.error("AI API timeout - using local tags");
      } else {
        console.error("AI API error (swallowed):", errorMsg, "Status:", errorStatus);
      }
    }

    console.log("AI tags:", aiTags);

    // 3. If Gemini fails, times out, or returns empty → fallback to localTags
    // Use localTags if available, otherwise use aiTags
    const finalTags = localTags.length > 0 ? localTags : aiTags;
    console.log("Final tags:", finalTags);

    // 4. Return normalized tags only
    return NextResponse.json({ 
      tags: finalTags.filter((tag: string) => AVAILABLE_TAGS.includes(tag)),
      exclude: aiExclude 
    });
  } catch (error) {
    // Last resort fallback - should never happen, but ensure we never throw
    console.error("Unexpected error in intent API:", error);
    const fallbackTags = text ? localIntent(text) : [];
    return NextResponse.json({ 
      tags: fallbackTags.filter((tag: string) => AVAILABLE_TAGS.includes(tag)),
      exclude: [] 
    });
  }
}
