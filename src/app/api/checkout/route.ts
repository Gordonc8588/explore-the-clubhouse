import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  getClubById,
  getBookingOptions,
  formatPrice,
} from "@/lib/mock-data";

interface CheckoutRequestBody {
  clubId: string;
  clubSlug: string;
  bookingOptionId: string;
  selectedDates: string[];
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childrenCount: number;
  promoCodeId: string | null;
}

// Mock promo codes - in production, fetch from database
const mockPromoCodes = [
  {
    id: "promo-1",
    code: "EARLYBIRD",
    discount_percent: 10,
  },
  {
    id: "promo-2",
    code: "SUMMER20",
    discount_percent: 20,
  },
];

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." },
        { status: 500 }
      );
    }

    const body: CheckoutRequestBody = await request.json();

    const {
      clubId,
      clubSlug,
      bookingOptionId,
      selectedDates,
      parentName,
      parentEmail,
      parentPhone,
      childrenCount,
      promoCodeId,
    } = body;

    // Validate required fields
    if (!clubId || !bookingOptionId || !parentName || !parentEmail || !parentPhone || !childrenCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get club and booking option
    const club = getClubById(clubId);
    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    const bookingOptions = getBookingOptions(clubId);
    const bookingOption = bookingOptions.find((opt) => opt.id === bookingOptionId);
    if (!bookingOption) {
      return NextResponse.json(
        { error: "Booking option not found" },
        { status: 404 }
      );
    }

    // Calculate pricing
    let subtotal = 0;
    if (bookingOption.option_type === "full_week") {
      subtotal = bookingOption.price_per_child * childrenCount;
    } else if (bookingOption.option_type === "single_day") {
      subtotal = bookingOption.price_per_child * childrenCount;
    } else {
      // multi_day
      subtotal = bookingOption.price_per_child * selectedDates.length * childrenCount;
    }

    // Apply promo code if provided
    let discountPercent = 0;
    let promoCode = null;
    if (promoCodeId) {
      promoCode = mockPromoCodes.find((p) => p.id === promoCodeId);
      if (promoCode) {
        discountPercent = promoCode.discount_percent;
      }
    }

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal - discountAmount;

    // Build line item description
    let description = `${bookingOption.name} - ${childrenCount} ${childrenCount === 1 ? "child" : "children"}`;
    if (bookingOption.option_type === "multi_day" && selectedDates.length > 0) {
      description += ` (${selectedDates.length} days)`;
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: parentEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: club.name,
              description: description,
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      metadata: {
        clubId,
        clubSlug,
        bookingOptionId,
        selectedDates: JSON.stringify(selectedDates),
        parentName,
        parentEmail,
        parentPhone,
        childrenCount: String(childrenCount),
        promoCodeId: promoCodeId || "",
        subtotal: String(subtotal),
        discountAmount: String(discountAmount),
        total: String(total),
      },
      success_url: `${baseUrl}/book/${clubSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/${clubSlug}?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
