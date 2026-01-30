import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import type { ConversationRole } from "@/types/database";
import { getProxiedImageUrl } from "@/lib/cloudinary";

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

const conversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]) as z.ZodType<ConversationRole>,
  content: z.string(),
  timestamp: z.number(),
  generatedContent: z.object({
    subject: z.string(),
    previewText: z.string(),
    bodyHtml: z.string(),
  }).optional(),
});

const currentFormStateSchema = z.object({
  subject: z.string(),
  previewText: z.string(),
  bodyHtml: z.string(),
});

const generateSchema = z.object({
  roughDraft: z.string().min(1, "Draft content is required"),
  images: z.array(imageSchema).optional().default([]),
  clubId: z.string().uuid().optional().nullable(),
  promoCodeId: z.string().uuid().optional().nullable(),
  // Follow-up conversation fields
  conversationHistory: z.array(conversationMessageSchema).optional().default([]),
  followUpPrompt: z.string().optional(),
  currentFormState: currentFormStateSchema.optional(),
  summarizedContext: z.string().optional(),
});

// Token estimation utilities
const TOKEN_LIMIT = 100000; // Summarize when approaching this limit

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function estimateConversationTokens(
  conversationHistory: z.infer<typeof conversationMessageSchema>[],
  currentFormState?: z.infer<typeof currentFormStateSchema>,
  summarizedContext?: string
): number {
  let total = 0;

  // Count conversation history
  for (const msg of conversationHistory) {
    total += estimateTokens(msg.content);
    if (msg.generatedContent) {
      total += estimateTokens(msg.generatedContent.subject);
      total += estimateTokens(msg.generatedContent.previewText);
      total += estimateTokens(msg.generatedContent.bodyHtml);
    }
  }

  // Count current form state
  if (currentFormState) {
    total += estimateTokens(currentFormState.subject);
    total += estimateTokens(currentFormState.previewText);
    total += estimateTokens(currentFormState.bodyHtml);
  }

  // Count summarized context
  if (summarizedContext) {
    total += estimateTokens(summarizedContext);
  }

  return total;
}

async function summarizeConversationHistory(
  anthropic: Anthropic,
  conversationHistory: z.infer<typeof conversationMessageSchema>[],
  keepLastN: number = 2
): Promise<{ summarizedContext: string; keptMessages: z.infer<typeof conversationMessageSchema>[] }> {
  // Keep the last N exchanges (user + assistant pairs)
  const keptMessages = conversationHistory.slice(-keepLastN * 2);
  const toSummarize = conversationHistory.slice(0, -keepLastN * 2);

  if (toSummarize.length === 0) {
    return { summarizedContext: "", keptMessages };
  }

  // Build summary of older messages
  const historyText = toSummarize.map(msg => {
    let text = `${msg.role}: ${msg.content}`;
    if (msg.generatedContent) {
      text += `\n[Generated: Subject "${msg.generatedContent.subject}"]`;
    }
    return text;
  }).join("\n\n");

  const summaryResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Summarize this newsletter editing conversation history concisely, capturing key decisions, preferences expressed, and the evolution of the content. Keep it brief but preserve important context:\n\n${historyText}`,
    }],
    system: "You are summarizing a conversation history for context. Be concise but preserve key decisions and preferences.",
  });

  const textBlock = summaryResponse.content.find(block => block.type === "text");
  const summarizedContext = textBlock?.type === "text" ? textBlock.text : "";

  return { summarizedContext, keptMessages };
}

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

// Enhanced system prompt for newsletter generation with vision
const SYSTEM_PROMPT = `You are an expert email marketing copywriter and HTML designer for "The Clubhouse", a premium children's holiday club set on a working farm in the Scottish Borders, UK.

## About The Clubhouse
The Clubhouse offers unforgettable farm experiences for children aged 5-12 during school holidays. Activities include:
- Animal care: feeding lambs, collecting eggs, grooming ponies
- Nature exploration: woodland walks, pond dipping, bug hunts
- Creative activities: seasonal crafts, den building, outdoor cooking
- Active play: adventure playground, games, team challenges
- Farm education: learning about sustainable farming and countryside life

The setting is a beautiful working farm with animals including sheep, chickens, pigs, ponies, and more. Children make lasting memories and friendships in a safe, nurturing environment.

## Brand Identity
- Tone: Warm, welcoming, enthusiastic yet professional
- Values: Family, adventure, nature, safety, memorable childhood experiences
- Audience: Parents seeking enriching, screen-free holiday activities for children
- Use British English spelling throughout

## Brand Design System
- Colors: Olive (#7A7C4A), Cream (#F5F4ED), Burnt Orange (#D4843E), Dark Olive (#5A5C3A)
- Typography: Playfair Display for headings, Nunito Sans for body
- Style: Clean, modern, warm with organic countryside feel

## EMAIL DELIVERABILITY BEST PRACTICES - CRITICAL
To ensure emails land in the Primary inbox (not Promotions/Spam), follow these rules strictly:

### Content Rules
- **NO SPAMMY WORDS**: Avoid "FREE", "BUY NOW", "LIMITED TIME OFFER", "ACT NOW", "HURRY", "DON'T MISS OUT", excessive urgency language
- **NO ALL CAPS**: Never use all caps for emphasis (use bold or colour instead)
- **NO EXCESSIVE PUNCTUATION**: Never use multiple exclamation marks (!!) or question marks (??)
- **CONVERSATIONAL TONE**: Write like you're talking to a friend, not selling to a customer
- **BALANCED TEXT-TO-IMAGE RATIO**: Ensure substantial text content accompanies images (aim for 60% text, 40% images)
- **LIMIT LINKS**: Use only 1-2 links maximum in the email body (not counting the main CTA)
- **SINGLE FOCUSED CTA**: One clear call-to-action, not multiple competing buttons

### Writing Style for Deliverability
- Use friendly, personal language ("We'd love to see your little ones...")
- Ask genuine questions to encourage replies ("What activities does your child enjoy most?")
- Share stories and experiences rather than just promotions
- Be specific rather than generic ("Our spring lambs arrived last week" not "Amazing deals await!")
- Use gentle urgency ("Spaces are filling up" not "BOOK NOW BEFORE IT'S TOO LATE!")

### Subject Line Rules
- Keep under 50 characters ideally (max 60)
- Use ONE emoji maximum, and only if it feels natural
- Avoid spam trigger words in subject lines especially
- Make it sound personal and interesting, not salesy
- Good: "Spring lambs have arrived at the farm"
- Bad: "AMAZING OFFER! 50% OFF - DON'T MISS OUT!!!"

## Image Handling - IMPORTANT
1. **USE ALL PROVIDED IMAGES** - Every image uploaded must appear in the newsletter
2. Analyze each image to understand its content, mood, and subjects
3. Place images strategically throughout the content for visual rhythm
4. Use image placeholders in the format: {{IMAGE_1}}, {{IMAGE_2}}, etc.
5. Placement types:
   - Hero: Full-width at top (style="width: 100%; max-width: 560px; height: auto; border-radius: 12px; display: block; margin: 0 auto 24px auto;")
   - Inline: Within content (style="width: 70%; max-width: 400px; height: auto; border-radius: 8px; margin: 16px auto; display: block;")
   - Feature: Two-column with text using table layout (avoid float for email compatibility)

## Content Guidelines - AVOID DUPLICATION
- **DO NOT** include a separate "Club Details" box with dates/times/ages - this is added automatically by the email template
- **DO NOT** include a separate "Promo Code" box - this is added automatically by the email template
- Instead, weave the club dates and any promo naturally into your compelling copy
- Focus on emotional benefits: memories, friendships, adventure, happy children
- Include a clear call-to-action encouraging parents to book

## When User Input is Minimal
If the admin provides only brief notes, use your initiative to create compelling copy:
- Draw on the club details provided (name, dates, activities)
- Create vivid descriptions of farm activities children will enjoy
- Emphasise benefits parents care about: safe environment, active play, making friends
- Build gentle excitement (spaces filling up, popular sessions) - NOT aggressive urgency
- Use sensory language: imagine your child's delight, the fresh countryside air, etc.

## HTML Output Requirements
- Use semantic HTML (h2, h3, p, ul, li)
- Use inline CSS styles only (email-safe)
- Image format: <img src="{{IMAGE_N}}" alt="descriptive alt text" style="..." />
- All images: max-width: 100%; height: auto for responsiveness
- Add width attribute for Outlook: width="560" alongside max-width style
- No html/head/body wrapper tags - content only
- Use brand colors: headings #7A7C4A, accents #D4843E, body text #5A5C3A
- Keep paragraphs short and scannable
- Include one prominent CTA button with href="#" (will be replaced by system)

## Response Format
Respond with ONLY valid JSON (no markdown code blocks):
{
  "subject": "Subject line (max 50 chars preferred, 60 max, one emoji max if natural)",
  "previewText": "Preview text for inbox (max 90 chars, conversational tone)",
  "bodyHtml": "<h2 style=\\"...\\">..</h2><p>...</p>..."
}`;

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

    const {
      roughDraft,
      images,
      clubId,
      promoCodeId,
      conversationHistory,
      followUpPrompt,
      currentFormState,
      summarizedContext: existingSummarizedContext,
    } = parsed.data;

    const isFollowUp = conversationHistory.length > 0 && followUpPrompt;

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
- Morning Session: ${club.morning_start ? `${formatTime(club.morning_start)} - ${formatTime(club.morning_end!)}` : 'N/A'}
- Afternoon Session: ${club.afternoon_start ? `${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end!)}` : 'N/A'}
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

    // Build image info for the prompt
    let imageInfo = "";
    if (images.length > 0) {
      imageInfo = `
## Available Images (YOU MUST USE ALL ${images.length} IMAGES):
${images.map((img) => `- ${img.label}: ${img.description || "No description provided"}`).join("\n")}

IMPORTANT: Include ALL ${images.length} images in the newsletter HTML using placeholders {{IMAGE_1}} through {{IMAGE_${images.length}}}. Distribute them throughout the content for visual interest.
`;
    }

    // Initialize Anthropic client early (needed for summarization)
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Handle token limits and summarization for follow-ups
    let summarizedContext = existingSummarizedContext;
    let workingHistory = conversationHistory;

    if (isFollowUp) {
      const estimatedTokens = estimateConversationTokens(
        conversationHistory,
        currentFormState,
        existingSummarizedContext
      );

      if (estimatedTokens > TOKEN_LIMIT) {
        console.log(`Token estimate ${estimatedTokens} exceeds limit, summarizing...`);
        const result = await summarizeConversationHistory(anthropic, conversationHistory, 2);
        summarizedContext = result.summarizedContext;
        workingHistory = result.keptMessages;
      }
    }

    // Build user prompt for initial generation
    const initialUserPrompt = `Create a marketing newsletter email for The Clubhouse.

## Admin's Notes:
${roughDraft || "Create an engaging newsletter promoting this club with compelling copy about the farm experience."}
${clubInfo}${promoInfo}${imageInfo}

## Requirements:
1. Subject line (max 60 chars, can include emoji)
2. Preview text (max 90 chars)
3. HTML body with compelling marketing copy

## IMPORTANT REMINDERS:
- DO NOT create separate info boxes for club details or promo codes (these are added automatically by the email system)
- Instead, weave dates/promo info naturally into your persuasive copy
- ${images.length > 0 ? `USE ALL ${images.length} IMAGES with placeholders {{IMAGE_1}} to {{IMAGE_${images.length}}}` : "No images provided"}
- Focus on emotional appeal: the joy children experience, memories made, friendships formed
- Include one CTA button with href="#" (system will add real link)
- If notes are brief, use initiative to write vivid, compelling copy about the farm experience

## DELIVERABILITY CRITICAL:
- Write conversationally like emailing a friend - NOT like marketing copy
- NO spammy words (FREE, BUY NOW, LIMITED TIME, HURRY, ACT NOW)
- NO all caps, NO multiple exclamation marks
- Keep subject line under 50 chars, max one emoji
- Limit to 1-2 links in body text (excluding CTA)
- Encourage replies by asking a genuine question somewhere in the email`;

    // Build follow-up prompt if this is a refinement request
    const followUpUserPrompt = isFollowUp ? `The user wants to refine the newsletter content.

## Current Form State (including any manual edits):
- Subject: ${currentFormState?.subject || "(empty)"}
- Preview Text: ${currentFormState?.previewText || "(empty)"}
- Body HTML:
${currentFormState?.bodyHtml || "(empty)"}

## User's Refinement Request:
${followUpPrompt}

${clubInfo}${promoInfo}${imageInfo}

## Instructions:
Apply the user's requested changes to the current content. Maintain the same JSON response format.
${images.length > 0 ? `Continue using image placeholders {{IMAGE_1}} to {{IMAGE_${images.length}}} as needed.` : ""}

Respond with ONLY valid JSON (no markdown code blocks):
{
  "subject": "Updated subject line",
  "previewText": "Updated preview text",
  "bodyHtml": "<updated HTML content>"
}` : "";

    // Build message content with images for vision (for initial request)
    const imageContent: Anthropic.MessageParam["content"] = [];

    // Add images for vision analysis
    for (const image of images) {
      try {
        // Fetch the image and convert to base64
        const imageResponse = await fetch(image.url);
        if (!imageResponse.ok) {
          console.warn(`Failed to fetch image ${image.label}: ${imageResponse.status}`);
          continue;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        // Determine media type from response headers or URL
        const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
        const mediaType = contentType.split(";")[0].trim() as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp";

        // Add image with label context
        imageContent.push({
          type: "text",
          text: `[${image.label}${image.description ? ` - ${image.description}` : ""}]:`,
        });
        imageContent.push({
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

    // Build messages array for API call
    const messages: Anthropic.MessageParam[] = [];

    if (isFollowUp) {
      // Add summarized context as a system-like first message if present
      if (summarizedContext) {
        messages.push({
          role: "user",
          content: `[Previous conversation summary: ${summarizedContext}]`,
        });
        messages.push({
          role: "assistant",
          content: "I understand the context from our previous conversation. Let me continue helping you refine the newsletter.",
        });
      }

      // Add historical messages
      for (const msg of workingHistory) {
        if (msg.role === "user") {
          messages.push({
            role: "user",
            content: msg.content,
          });
        } else if (msg.role === "assistant" && msg.generatedContent) {
          // For assistant messages, include the JSON response they generated
          messages.push({
            role: "assistant",
            content: JSON.stringify({
              subject: msg.generatedContent.subject,
              previewText: msg.generatedContent.previewText,
              bodyHtml: msg.generatedContent.bodyHtml,
            }),
          });
        }
      }

      // Add the current follow-up request with images
      const followUpContent: Anthropic.MessageParam["content"] = [
        ...imageContent,
        { type: "text", text: followUpUserPrompt },
      ];
      messages.push({
        role: "user",
        content: followUpContent,
      });
    } else {
      // Initial generation: single user message with images
      const initialContent: Anthropic.MessageParam["content"] = [
        ...imageContent,
        { type: "text", text: initialUserPrompt },
      ];
      messages.push({
        role: "user",
        content: initialContent,
      });
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 8000,
      messages,
      system: SYSTEM_PROMPT,
    });

    // Extract the text response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse the JSON response
    let generated;
    try {
      // Try to extract JSON from the response (handle potential markdown code blocks)
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

    // Replace image placeholders with proxied URLs (own domain for email deliverability)
    let bodyHtml = generated.bodyHtml || "";
    for (let i = 0; i < images.length; i++) {
      const placeholder = `{{IMAGE_${i + 1}}}`;
      bodyHtml = bodyHtml.replace(new RegExp(placeholder, "g"), getProxiedImageUrl(images[i].url));
    }

    // Calculate estimated tokens for the response
    const estimatedTokens = estimateConversationTokens(
      workingHistory,
      { subject: generated.subject, previewText: generated.previewText, bodyHtml },
      summarizedContext
    );

    return NextResponse.json({
      subject: generated.subject,
      previewText: generated.previewText,
      bodyHtml: bodyHtml,
      conversationMetadata: {
        summarizedContext: summarizedContext || undefined,
        estimatedTokens,
        wasSummarized: summarizedContext !== existingSummarizedContext,
      },
    });
  } catch (error) {
    console.error("Error generating newsletter content:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate content";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
