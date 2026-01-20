import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getClubById, getBookingOptions } from '@/lib/mock-data';
import type { Booking, BookingStatus } from '@/types/database';

// =============================================================================
// TYPES
// =============================================================================

interface ParentDetails {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutRequestBody {
  clubId: string;
  optionId: string;
  selectedDates: string[];
  parentDetails: ParentDetails;
  numChildren: number;
  promoCode: string | null;
  totalAmount: number;
}

interface MockPromoCode {
  id: string;
  code: string;
  discount_percent: number;
}

// =============================================================================
// MOCK DATA STORE
// =============================================================================

// Mock promo codes - in production, fetch from database
const mockPromoCodes: MockPromoCode[] = [
  { id: 'promo-1', code: 'EARLYBIRD', discount_percent: 10 },
  { id: 'promo-2', code: 'SUMMER20', discount_percent: 20 },
  { id: 'promo-3', code: 'WELCOME15', discount_percent: 15 },
];

// Mock bookings storage - in production, this would be in the database
const mockBookings: Map<string, Booking> = new Map();

/**
 * Store a booking in mock storage
 * In production, this would insert into the database
 */
function storeBooking(booking: Booking): Booking {
  mockBookings.set(booking.id, booking);
  return booking;
}

/**
 * Get a booking by ID from mock storage
 */
export function getBookingById(id: string): Booking | undefined {
  return mockBookings.get(id);
}

/**
 * Update a booking in mock storage
 */
export function updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
  const existing = mockBookings.get(id);
  if (!existing) return undefined;

  const updated = { ...existing, ...updates };
  mockBookings.set(id, updated);
  return updated;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateRequestBody(body: unknown): { valid: true; data: CheckoutRequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const data = body as Record<string, unknown>;

  // Required fields
  if (!data.clubId || typeof data.clubId !== 'string') {
    return { valid: false, error: 'clubId is required and must be a string' };
  }

  if (!data.optionId || typeof data.optionId !== 'string') {
    return { valid: false, error: 'optionId is required and must be a string' };
  }

  if (!Array.isArray(data.selectedDates)) {
    return { valid: false, error: 'selectedDates is required and must be an array' };
  }

  if (!data.parentDetails || typeof data.parentDetails !== 'object') {
    return { valid: false, error: 'parentDetails is required and must be an object' };
  }

  const parentDetails = data.parentDetails as Record<string, unknown>;
  if (!parentDetails.name || typeof parentDetails.name !== 'string') {
    return { valid: false, error: 'parentDetails.name is required' };
  }
  if (!parentDetails.email || typeof parentDetails.email !== 'string') {
    return { valid: false, error: 'parentDetails.email is required' };
  }
  if (!parentDetails.phone || typeof parentDetails.phone !== 'string') {
    return { valid: false, error: 'parentDetails.phone is required' };
  }

  if (typeof data.numChildren !== 'number' || data.numChildren < 1) {
    return { valid: false, error: 'numChildren is required and must be a positive number' };
  }

  if (typeof data.totalAmount !== 'number' || data.totalAmount < 0) {
    return { valid: false, error: 'totalAmount is required and must be a non-negative number' };
  }

  return {
    valid: true,
    data: {
      clubId: data.clubId as string,
      optionId: data.optionId as string,
      selectedDates: data.selectedDates as string[],
      parentDetails: {
        name: parentDetails.name as string,
        email: parentDetails.email as string,
        phone: parentDetails.phone as string,
      },
      numChildren: data.numChildren as number,
      promoCode: typeof data.promoCode === 'string' ? data.promoCode : null,
      totalAmount: data.totalAmount as number,
    },
  };
}

// =============================================================================
// API ROUTE
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const {
      clubId,
      optionId,
      selectedDates,
      parentDetails,
      numChildren,
      promoCode,
      totalAmount,
    } = validation.data;

    // Validate club exists
    const club = getClubById(clubId);
    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Validate booking option exists
    const bookingOptions = getBookingOptions(clubId);
    const bookingOption = bookingOptions.find((opt) => opt.id === optionId);
    if (!bookingOption) {
      return NextResponse.json(
        { error: 'Booking option not found' },
        { status: 404 }
      );
    }

    // Validate promo code if provided
    let promoCodeRecord: MockPromoCode | null = null;
    if (promoCode) {
      promoCodeRecord = mockPromoCodes.find(
        (p) => p.code.toUpperCase() === promoCode.toUpperCase()
      ) || null;
      // Note: We don't fail if promo code is invalid, just ignore it
    }

    // Generate a unique booking ID
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Build line item description
    let description = `${bookingOption.name} - ${numChildren} ${numChildren === 1 ? 'child' : 'children'}`;
    if (bookingOption.option_type === 'multi_day' && selectedDates.length > 0) {
      description += ` (${selectedDates.length} days)`;
    } else if (bookingOption.option_type === 'single_day' && selectedDates.length > 0) {
      description += ` - ${selectedDates[0]}`;
    }

    // Create the pending booking in the database (mock)
    const pendingBooking: Booking = {
      id: bookingId,
      club_id: clubId,
      booking_option_id: optionId,
      parent_name: parentDetails.name,
      parent_email: parentDetails.email,
      parent_phone: parentDetails.phone,
      num_children: numChildren,
      total_amount: totalAmount,
      status: 'pending' as BookingStatus,
      promo_code_id: promoCodeRecord?.id || null,
      stripe_payment_intent_id: null,
      stripe_checkout_session_id: null,
      created_at: new Date().toISOString(),
    };

    // Store the booking with pending status
    storeBooking(pendingBooking);

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/book/${club.slug}/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`;
    const cancelUrl = `${baseUrl}/book/${club.slug}?cancelled=true&booking_id=${bookingId}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: parentDetails.email,
      client_reference_id: bookingId,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: club.name,
              description: description,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId,
        club_id: clubId,
        club_slug: club.slug,
        option_id: optionId,
        selected_dates: JSON.stringify(selectedDates),
        parent_name: parentDetails.name,
        parent_email: parentDetails.email,
        parent_phone: parentDetails.phone,
        num_children: String(numChildren),
        promo_code: promoCode || '',
        promo_code_id: promoCodeRecord?.id || '',
        total_amount: String(totalAmount),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Update booking with Stripe session ID
    updateBooking(bookingId, {
      stripe_checkout_session_id: session.id,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      bookingId: bookingId,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    // Handle specific Stripe errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create checkout session: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
