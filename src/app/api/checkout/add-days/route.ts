import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getClubById, formatPrice } from "@/lib/mock-data";

interface AddDaysCheckoutRequestBody {
  bookingId: string;
  clubId: string;
  clubSlug: string;
  selectedDates: string[];
  numChildren: number;
  pricePerDay: number;
  totalAmount: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  timeSlot: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    const body: AddDaysCheckoutRequestBody = await request.json();

    const {
      bookingId,
      clubId,
      clubSlug,
      selectedDates,
      numChildren,
      pricePerDay,
      totalAmount,
      parentName,
      parentEmail,
      parentPhone,
      timeSlot,
    } = body;

    // Validate required fields
    if (
      !bookingId ||
      !clubId ||
      !selectedDates ||
      selectedDates.length === 0 ||
      !numChildren ||
      !parentEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get club to verify it exists
    const club = getClubById(clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Format time string (HH:MM:SS or HH:MM) to display format (e.g., "3:00pm")
    const formatTime = (timeStr: string): string => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const period = hours >= 12 ? "pm" : "am";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
    };

    // Format time slot for display
    const formatTimeSlot = (slot: string) => {
      switch (slot) {
        case "full_day":
          return `Full Day (${formatTime(club.morning_start!)} - ${formatTime(club.afternoon_end!)})`;
        case "morning":
          return `Morning (${formatTime(club.morning_start!)} - ${formatTime(club.morning_end!)})`;
        case "afternoon":
          return `Afternoon (${formatTime(club.afternoon_start!)} - ${formatTime(club.afternoon_end!)})`;
        default:
          return "";
      }
    };

    // Build line item description
    const description = `Additional ${selectedDates.length} day${
      selectedDates.length !== 1 ? "s" : ""
    } - ${formatTimeSlot(timeSlot)} - ${numChildren} ${
      numChildren === 1 ? "child" : "children"
    }`;

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: parentEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${club.name} - Additional Days`,
              description: description,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "add_days",
        originalBookingId: bookingId,
        clubId,
        clubSlug,
        selectedDates: JSON.stringify(selectedDates),
        numChildren: String(numChildren),
        pricePerDay: String(pricePerDay),
        totalAmount: String(totalAmount),
        parentName,
        parentEmail,
        parentPhone,
        timeSlot,
      },
      success_url: `${baseUrl}/confirmation/${bookingId}?added_days=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/add-days/${bookingId}?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Add days checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
