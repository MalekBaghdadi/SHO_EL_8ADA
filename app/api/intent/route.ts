import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { localIntent } from "@/lib/localIntent";


// Available tags from the food system
const AVAILABLE_TAGS = [
  "comfort",   // comfort food, relaxing, cozy
  "healthy",   // healthy, diet, nutritious
  "light",     // light, easy on stomach
  "heavy",     // heavy, rich, filling, large portions
  "quick",     // quick, fast, on-the-go
  "trendy",    // popular, famous, modern
  "traditional",// traditional, authentic, classic
  "sweet",     // sweet, dessert, sugary
  "spicy",     // spicy, hot, heat
  "fresh",     // fresh, crisp, refreshing
];

// Available time-based exclusions
const AVAILABLE_EXCLUSIONS = ["tarwee2a", "8ada", "3asha"];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let text = "";
  try {
    const body = await request.json();
    text = body.text || "";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      const latencyMs = Date.now() - startTime;
      return NextResponse.json(
        {
          tags: [],
          exclude: [],
          meta: {
            input: typeof text === "string" ? text : "",
            localTags: [],
            aiTags: [],
            finalTags: [],
            source: "none" as const,
            latencyMs,
          },
        },
        { status: 200 }
      );
    }

    // 1. Compute localTags (fast & deterministic)
    const localTags = localIntent(text);

    let aiTags: string[] = [];
    let aiExclude: string[] = [];

    // 2. Try calling Gemini for semantic fallback + enrichment
    try {
      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try multiple model names as fallback
        const modelNames = [
          "gemini-1.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash-latest",
          "gemini-1.5-pro",
        ];

        const prompt = `You are a food intent parser for a Lebanese food suggestion app. Extract tags from user input.

AVAILABLE TAGS (use ONLY these exact string values):
- "comfort" = comfort food, relaxing, cozy
- "healthy" = healthy, diet, light eating  
- "light" = light, not heavy, easy on stomach
- "heavy" = heavy, rich, filling, large portions
- "quick" = quick, fast, on-the-go
- "trendy" = popular, modern, famous
- "traditional" = traditional, classic, authentic
- "sweet" = sweet, dessert, sugary
- "spicy" = spicy, hot, heat
- "fresh" = fresh, crisp, refreshing

EXCLUSIONS (by timeOfDay):
- "tarwee2a", "8ada", "3asha"

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

            // Add timeout to prevent hanging (10 seconds)
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Gemini API timeout")), 10000)
            );

            const result = await Promise.race([
              model.generateContent(prompt),
              timeoutPromise
            ]) as any;

            responseText = result.response.text().trim();
            modelWorked = true;
            break; // Success, exit loop
          } catch (modelError: any) {
            if (modelError?.status === 404 || modelError?.status === 429) {
              continue;
            } else {
              throw modelError;
            }
          }
        }

        if (modelWorked) {
          // Try to extract JSON from response
          try {
            const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const intent = JSON.parse(cleaned);

            // Validate and sanitize the response
            aiTags = Array.isArray(intent.tags)
              ? intent.tags.filter((tag: string) => AVAILABLE_TAGS.includes(tag))
              : [];

            aiExclude = Array.isArray(intent.exclude)
              ? intent.exclude.filter((cat: string) => AVAILABLE_EXCLUSIONS.includes(cat))
              : [];
          } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
          }
        }
      }
    } catch (error: any) {
      // Swallow all AI errors (rate limits, timeouts, etc.)
      const errorMsg = error?.message || String(error);
      const errorStatus = error?.status;

    }

    // 3. Merge results: union of localTags and aiTags
    const combinedTags = Array.from(new Set([...localTags, ...aiTags]));
    const finalTags = combinedTags.filter((tag: string) => AVAILABLE_TAGS.includes(tag));

    const latencyMs = Date.now() - startTime;
    const source: "local" | "gemini" | "both" | "none" =
      finalTags.length === 0
        ? "none"
        : localTags.length > 0 && aiTags.length > 0
          ? "both"
          : localTags.length > 0
            ? "local"
            : "gemini";

    return NextResponse.json({
      tags: finalTags,
      exclude: aiExclude,
      meta: {
        input: text,
        localTags,
        aiTags,
        finalTags,
        source,
        latencyMs,
      },
    });
  } catch (error) {
    const localTags = text ? localIntent(text) : [];
    const finalTags = localTags.filter((tag: string) => AVAILABLE_TAGS.includes(tag));
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      tags: finalTags,
      exclude: [],
      meta: {
        input: text,
        localTags,
        aiTags: [],
        finalTags,
        source: finalTags.length > 0 ? "local" : "none",
        latencyMs,
      },
    });
  }
}
