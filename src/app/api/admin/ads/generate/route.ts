import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

const imageSchema = z.object({
  url: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const generateSchema = z.object({
  images: z.array(imageSchema).min(1, "At least one image is required"),
  clubId: z.string().uuid().optional().nullable(),
  promoCodeId: z.string().uuid().optional().nullable(),
  objective: z.enum(["OUTCOME_AWARENESS", "OUTCOME_TRAFFIC", "OUTCOME_SALES"]),
  notes: z.string().optional(),
  regenerateField: z.enum(["primaryText", "headline", "description"]).optional(),
  existingContent: z.object({
    primaryText: z.string().optional(),
    headline: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

// Format date to readable string
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Meta Ad Copy character limits
const CHAR_LIMITS = {
  primaryText: { recommended: 125, max: 1000 },
  headline: { recommended: 40, max: 255 },
  description: { recommended: 30, max: 255 },
};

// System prompt for Meta ad copy generation
const SYSTEM_PROMPT = `You are an expert social media advertising copywriter for "The Clubhouse", a premium children's holiday club set on a working farm in Surrey, UK.

## About The Clubhouse
The Clubhouse offers unforgettable farm experiences for children aged 5-12 during school holidays. Activities include:
- Animal care: feeding lambs, collecting eggs, grooming ponies
- Nature exploration: woodland walks, pond dipping, bug hunts
- Creative activities: seasonal crafts, den building, outdoor cooking
- Active play: adventure playground, games, team challenges
- Farm education: learning about sustainable farming and countryside life

## Brand Identity
- Tone: Warm, welcoming, enthusiastic yet professional
- Values: Family, adventure, nature, safety, memorable childhood experiences
- Audience: Parents (especially mums) seeking enriching, screen-free holiday activities
- Use British English spelling throughout

## Meta Ad Policy Compliance - CRITICAL
Your ad copy MUST comply with Meta's advertising policies:
- NO exaggerated claims or false promises
- NO pressure tactics or artificial urgency ("Last chance!", "Act now!")
- NO discriminatory content
- NO references to personal attributes ("Are you a parent who...")
- Focus on the experience, not the parent's identity
- Be factual and honest about what the club offers

## Character Limits - STRICT
- Primary Text: 125 characters recommended (max 1000) - This appears above the image
- Headline: 40 characters recommended (max 255) - Bold text below image
- Description: 30 characters recommended (max 255) - Smaller text below headline

## Writing Guidelines
1. PRIMARY TEXT: Tell a micro-story or paint a picture. Focus on what children experience.
   Good: "Watch their faces light up as they feed the lambs and collect fresh eggs. This Easter, give them a farm adventure they'll never forget."

2. HEADLINE: Punchy, benefit-focused, action-oriented
   Good: "Farm Fun This Easter" or "Book Their Adventure"

3. DESCRIPTION: Supporting detail or call-to-action
   Good: "Ages 5-11. Book today!" or "Spaces filling fast"

## Image Analysis
Analyze the provided images carefully. Reference specific visual elements to make the copy feel authentic and connected to what the viewer sees.

## Response Format
Respond with ONLY valid JSON (no markdown code blocks):
{
  "primaryText": "Your compelling primary text here (aim for 125 chars)",
  "headline": "Your punchy headline (aim for 40 chars)",
  "description": "Supporting detail (aim for 30 chars)"
}`;

// Prompt for regenerating a single field
function getRegeneratePrompt(
  field: "primaryText" | "headline" | "description",
  existingContent: { primaryText?: string; headline?: string; description?: string }
): string {
  const fieldDescriptions = {
    primaryText: "Primary Text (the main message above the image, aim for 125 chars)",
    headline: "Headline (punchy bold text below image, aim for 40 chars)",
    description: "Description (supporting detail below headline, aim for 30 chars)",
  };

  return `Generate ONLY a new ${fieldDescriptions[field]} for this Meta ad.

Current ad content:
- Primary Text: ${existingContent.primaryText || "(empty)"}
- Headline: ${existingContent.headline || "(empty)"}
- Description: ${existingContent.description || "(empty)"}

Create a fresh, different version of the ${field} that:
1. Complements the other ad elements
2. Stays within character limits
3. Feels fresh and different from the current version

Respond with ONLY valid JSON:
{
  "${field}": "Your new ${field} here"
}`;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { images, clubId, promoCodeId, objective, notes, regenerateField, existingContent } = parsed.data;

    const supabase = createAdminClient();

    // Fetch club details if provided
    let clubInfo = "";
    if (clubId) {
      const { data: club } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .single();

      if (club) {
        clubInfo = `
## Club Being Promoted:
- Name: ${club.name}
- Dates: ${formatDate(club.start_date)} to ${formatDate(club.end_date)}
- Age Range: ${club.min_age} to ${club.max_age} years
`;
      }
    }

    // Fetch promo code if provided
    let promoInfo = "";
    if (promoCodeId) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("id", promoCodeId)
        .single();

      if (promo) {
        promoInfo = `
## Promo Code Available:
- Code: ${promo.code}
- Discount: ${promo.discount_percent}% off
`;
      }
    }

    // Map objective to human-readable goal
    const objectiveDescriptions: Record<string, string> = {
      OUTCOME_AWARENESS: "Build brand awareness - focus on emotional storytelling",
      OUTCOME_TRAFFIC: "Drive website traffic - encourage clicks with curiosity",
      OUTCOME_SALES: "Generate bookings - include clear call-to-action",
    };

    // Build the user prompt
    let userPrompt: string;

    if (regenerateField && existingContent) {
      userPrompt = getRegeneratePrompt(regenerateField, existingContent);
    } else {
      userPrompt = `Create Meta ad copy for The Clubhouse children's holiday club.

## Campaign Objective
${objectiveDescriptions[objective]}

${clubInfo}${promoInfo}
## Admin Notes
${notes || "Create engaging ad copy that highlights the farm experience for children."}

## Images Provided
${images.map((img, i) => `${i + 1}. ${img.label}: ${img.description || "No description"}`).join("\n")}

Analyze the images and create ad copy that:
1. Connects to what's visible in the images
2. Appeals to parents seeking enriching activities for their children
3. Highlights the unique farm experience
4. Stays within Meta's recommended character limits

Respond with ONLY valid JSON:
{
  "primaryText": "Your compelling primary text (aim for 125 chars)",
  "headline": "Your punchy headline (aim for 40 chars)",
  "description": "Supporting detail (aim for 30 chars)"
}`;
    }

    // Build message content with images
    const messageContent: Anthropic.MessageParam["content"] = [];

    // Add images for vision analysis
    for (const image of images) {
      try {
        const imageResponse = await fetch(image.url);
        if (!imageResponse.ok) {
          console.warn(`Failed to fetch image ${image.label}: ${imageResponse.status}`);
          continue;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
        const mediaType = contentType.split(";")[0].trim() as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp";

        messageContent.push({
          type: "text",
          text: `[${image.label}${image.description ? ` - ${image.description}` : ""}]:`,
        });
        messageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64,
          },
        });
      } catch (err) {
        console.warn(`Error processing image ${image.label}:`, err);
      }
    }

    // Add the prompt
    messageContent.push({
      type: "text",
      text: userPrompt,
    });

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
    let generated;
    try {
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith("```")) {
        jsonText = jsonText.slice(0, -3);
      }
      generated = JSON.parse(jsonText.trim());
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Failed to parse AI response");
    }

    // If regenerating a single field, return just that field
    if (regenerateField) {
      return NextResponse.json({
        [regenerateField]: generated[regenerateField],
      });
    }

    // Return full ad copy with character counts
    return NextResponse.json({
      primaryText: generated.primaryText,
      headline: generated.headline,
      description: generated.description,
      charCounts: {
        primaryText: generated.primaryText?.length || 0,
        headline: generated.headline?.length || 0,
        description: generated.description?.length || 0,
      },
      limits: CHAR_LIMITS,
    });
  } catch (error) {
    console.error("Error generating ad content:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate content";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
