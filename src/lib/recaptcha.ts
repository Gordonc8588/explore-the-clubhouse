/**
 * Server-side reCAPTCHA v3 token verification
 * Gracefully handles missing configuration
 */

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

interface VerifyResult {
  success: boolean;
  score?: number;
  error?: string;
}

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MINIMUM_SCORE = 0.5;

/**
 * Check if reCAPTCHA is configured
 */
export function isRecaptchaConfigured(): boolean {
  return !!(
    process.env.RECAPTCHA_SECRET_KEY &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  );
}

/**
 * Verify a reCAPTCHA token server-side
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - Optional action name to verify
 * @returns Verification result
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: string
): Promise<VerifyResult> {
  // If reCAPTCHA is not configured, gracefully pass
  if (!isRecaptchaConfigured()) {
    console.warn("reCAPTCHA not configured, skipping verification");
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Missing reCAPTCHA token" };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: token,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to verify reCAPTCHA" };
    }

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      const errorCodes = data["error-codes"]?.join(", ") || "Unknown error";
      return { success: false, error: `reCAPTCHA verification failed: ${errorCodes}` };
    }

    // Check score (v3 specific)
    if (data.score !== undefined && data.score < MINIMUM_SCORE) {
      return {
        success: false,
        score: data.score,
        error: "reCAPTCHA score too low",
      };
    }

    // Verify action if provided
    if (expectedAction && data.action !== expectedAction) {
      return {
        success: false,
        score: data.score,
        error: "reCAPTCHA action mismatch",
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, error: "reCAPTCHA verification failed" };
  }
}
