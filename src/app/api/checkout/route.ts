import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const supabase = createAdminClient();

    // Get club from database
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    // Get booking option from database
    const { data: bookingOption, error: optionError } = await supabase
      .from('booking_options')
      .select('*')
      .eq('id', bookingOptionId)
      .eq('club_id', clubId)
      .single();

    if (optionError || !bookingOption) {
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
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('id', promoCodeId)
        .eq('is_active', true)
        .single();

      if (promo) {
        promoCode = promo;
        discountPercent = promo.discount_percent;
      }
    }

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal - discountAmount;

    // Create pending booking in database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        club_id: clubId,
        booking_option_id: bookingOptionId,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        num_children: childrenCount,
        total_amount: total,
        status: 'pending',
        promo_code_id: promoCodeId || null,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Build line item description
    let description = `${bookingOption.name} - ${childrenCount} ${childrenCount === 1 ? "child" : "children"}`;
    if (bookingOption.option_type === "multi_day" && selectedDates.length > 0) {
      description += ` (${selectedDates.length} days)`;
    }

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
              name: club.name,
              description: description,
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
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
      success_url: `${baseUrl}/complete/${booking.id}`,
      cancel_url: `${baseUrl}/book/${clubSlug}?cancelled=true`,
    });

    // Update booking with Stripe session ID
    await supabase
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', booking.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
