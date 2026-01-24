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

const generateSchema = z.object({
  roughDraft: z.string().min(1, "Draft content is required"),
  clubId: z.string().uuid().optional().nullable(),
  promoCodeId: z.string().uuid().optional().nullable(),
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

// Format time to readable string
function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes}${ampm}`;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for API key
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

    const { roughDraft, clubId, promoCodeId } = parsed.data;

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
## Featured Club Details:
- Name: ${club.name}
- Dates: ${formatDate(club.start_date)} to ${formatDate(club.end_date)}
- Age Range: ${club.min_age} to ${club.max_age} years
- Morning Session: ${formatTime(club.morning_start)} - ${formatTime(club.morning_end)}
- Afternoon Session: ${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end)}
- Description: ${club.description || "Fun-filled farm activities for children"}
`;
      }
    }

    // Fetch promo code details if provided
    let promoInfo = "";
    if (promoCodeId) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("id", promoCodeId)
        .single();

      if (promo) {
        promoInfo = `
## Promo Code to Highlight:
- Code: ${promo.code}
- Discount: ${promo.discount_percent}% off
- Valid: ${formatDate(promo.valid_from)} to ${formatDate(promo.valid_until)}
`;
      }
    }

    // Build prompt for Claude
    const systemPrompt = `You are a marketing copywriter for "The Clubhouse", a children's holiday club set on a working farm in the UK. The brand tone is warm, friendly, and family-oriented.

The Clubhouse offers fun-filled farm experiences for children aged 5-11 during school holidays. Activities include animal care, outdoor adventures, crafts, and nature exploration.

Brand Guidelines:
- Use British English spelling
- Tone should be warm, enthusiastic but not overly casual
- Focus on the unique farm experience and outdoor activities
- Emphasize safety, fun, and memorable experiences
- Appeal to parents looking for enriching holiday activities for their children`;

    const userPrompt = `Please write a marketing newsletter email based on the following notes from the admin:

## Admin's Draft Notes:
${roughDraft}
${clubInfo}${promoInfo}

Please generate:
1. A compelling email subject line (max 60 characters)
2. A preview text/preheader (max 90 characters - this appears in email inbox previews)
3. The email body content as HTML

For the body HTML:
- Use semantic HTML (h2, h3, p, ul, li tags)
- Do not include full HTML document structure (no html, head, body tags)
- Include engaging headers and well-formatted paragraphs
- If a club is mentioned, include its key details naturally
- If a promo code is mentioned, highlight it prominently
- End with a call-to-action encouraging booking
- Keep the overall length appropriate for an email (not too long)

Respond in the following JSON format only (no markdown code blocks):
{
  "subject": "Your subject line here",
  "previewText": "Your preview text here",
  "bodyHtml": "<h2>Your HTML content here</h2><p>More content...</p>"
}`;

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract the text response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse the JSON response
    let generated;
    try {
      generated = JSON.parse(textContent.text);
    } catch {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Failed to parse AI response");
    }

    return NextResponse.json({
      subject: generated.subject,
      previewText: generated.previewText,
      bodyHtml: generated.bodyHtml,
    });
  } catch (error) {
    console.error("Error generating newsletter content:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate content";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
