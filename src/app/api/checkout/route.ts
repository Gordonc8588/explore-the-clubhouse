import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingTokenQuery } from "@/lib/booking-access";
import { priceBooking } from "@/lib/pricing";

interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  referrer: string | null;
}

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
  utmParams?: UTMParams;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error("[Checkout] Stripe not initialized. STRIPE_SECRET_KEY present:", !!process.env.STRIPE_SECRET_KEY);
      console.error("[Checkout] Key prefix:", process.env.STRIPE_SECRET_KEY?.substring(0, 8));
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." },
        { status: 500 }
      );
    }

    console.log("[Checkout] Stripe initialized, processing request...");

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
      utmParams,
    } = body;

    // Validate required fields
    if (!clubId || !bookingOptionId || !parentName || !parentEmail || !parentPhone || !childrenCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate children count (max 5 per booking)
    const MAX_CHILDREN_PER_BOOKING = 5;
    if (childrenCount < 1 || childrenCount > MAX_CHILDREN_PER_BOOKING) {
      return NextResponse.json(
        { error: `Number of children must be between 1 and ${MAX_CHILDREN_PER_BOOKING}. For larger groups, please contact us.` },
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

    // Validate capacity for all booking types
    {
      let daysToCheck: { id: string; date: string; morning_capacity: number }[] = [];

      if (bookingOption.option_type === "full_week") {
        const { data: clubDays } = await supabase
          .from('club_days')
          .select('id, date, morning_capacity')
          .eq('club_id', clubId)
          .eq('is_available', true);
        daysToCheck = clubDays || [];
      } else {
        // single_day or multi_day — check the specific selected dates
        if (selectedDates && selectedDates.length > 0) {
          const { data: clubDays } = await supabase
            .from('club_days')
            .select('id, date, morning_capacity')
            .eq('club_id', clubId)
            .eq('is_available', true)
            .in('date', selectedDates);
          daysToCheck = clubDays || [];
        }
      }

      for (const day of daysToCheck) {
        const { data: availability } = await supabase
          .rpc('get_club_day_availability', { day_id: day.id });
        const avail = availability?.[0];
        if (avail) {
          const morningRemaining = avail.morning_capacity - avail.morning_booked;
          if (morningRemaining < childrenCount) {
            // Format the date for a user-friendly error message
            const [year, month, dayNum] = day.date.split('-').map(Number);
            const dateObj = new Date(Date.UTC(year, month - 1, dayNum));
            const dayName = dateObj.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            });

            if (morningRemaining <= 0) {
              return NextResponse.json(
                { error: `${dayName} is fully booked. Please choose a different day.` },
                { status: 400 }
              );
            } else {
              return NextResponse.json(
                { error: `${dayName} only has ${morningRemaining} ${morningRemaining === 1 ? "spot" : "spots"} remaining. Please reduce the number of children or choose a different day.` },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // Apply promo code if provided
    let discountPercent = 0;
    if (promoCodeId) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('id', promoCodeId)
        .eq('is_active', true)
        .single();

      if (promo) {
        discountPercent = promo.discount_percent;
      }
    }

    // Calculate pricing — canonical engine (see src/lib/pricing.ts)
    const {
      subtotalPence: subtotal,
      discountAmountPence: discountAmount,
      totalPence: total,
    } = priceBooking({
      optionType: bookingOption.option_type,
      pricePerChild: bookingOption.price_per_child,
      dayCount: selectedDates.length,
      numChildren: childrenCount,
      discountPercent,
    });

    // Create pending booking in database with UTM attribution
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
        // Snapshot the discount rate actually applied so later modifications
        // re-price against what the customer paid, not a drifted live promo.
        discount_percent_applied: discountPercent,
        // UTM attribution
        utm_source: utmParams?.utm_source || null,
        utm_medium: utmParams?.utm_medium || null,
        utm_campaign: utmParams?.utm_campaign || null,
        landing_page: utmParams?.landing_page || null,
        referrer: utmParams?.referrer || null,
        // Check if this is a newsletter attribution
        attributed_newsletter_id: utmParams?.utm_source === 'newsletter' && utmParams?.utm_campaign
          ? utmParams.utm_campaign
          : null,
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
        // UTM attribution for webhook
        utmSource: utmParams?.utm_source || "",
        utmMedium: utmParams?.utm_medium || "",
        utmCampaign: utmParams?.utm_campaign || "",
      },
      success_url: `${baseUrl}/complete/${booking.id}${bookingTokenQuery(booking.id)}`,
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

    // Log more details for Stripe errors
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      if ('type' in error) {
        console.error("Stripe error type:", (error as { type: string }).type);
      }
      if ('code' in error) {
        console.error("Stripe error code:", (error as { code: string }).code);
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
