import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Child } from "@/types/database";
import { updateBooking, getBookingById } from "../stripe/checkout/route";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const childSchema = z.object({
  childName: z.string().min(1, "Child name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  allergies: z.string().optional().default(""),
  medicalNotes: z.string().optional().default(""),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  photoConsent: z.boolean(),
  activityConsent: z.literal(true, "Activity consent is required"),
  medicalConsent: z.literal(true, "Medical consent is required"),
});

const createChildrenRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  children: z.array(childSchema).min(1, "At least one child is required"),
});

type CreateChildrenRequest = z.infer<typeof createChildrenRequestSchema>;

// =============================================================================
// MOCK DATA STORE
// =============================================================================

// In-memory store for mock data (in production, this would be a database)
const savedChildren: Map<string, Child[]> = new Map();

/**
 * Mock transaction helper
 * In production, this would use database transactions
 */
async function runTransaction<T>(
  operations: () => Promise<T>
): Promise<{ success: true; result: T } | { success: false; error: string }> {
  try {
    const result = await operations();
    return { success: true, result };
  } catch (error) {
    // In production, this would rollback the transaction
    console.error("[Transaction] Rolling back due to error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transaction failed",
    };
  }
}

/**
 * Save children to the database (mock)
 * In production, this would insert into the children table
 */
function saveChildren(bookingId: string, children: Child[]): void {
  savedChildren.set(bookingId, children);
  console.log(`[Children API] Saved ${children.length} children for booking ${bookingId}`);
}

/**
 * Get children for a booking from the database (mock)
 */
function getChildrenByBookingId(bookingId: string): Child[] {
  return savedChildren.get(bookingId) || [];
}

// =============================================================================
// API ROUTES
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with zod
    const validation = createChildrenRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    const { bookingId, children } = validation.data;

    // Verify booking exists and is in 'paid' status
    const booking = getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "paid") {
      return NextResponse.json(
        {
          error: `Cannot add children to booking with status '${booking.status}'. Booking must be in 'paid' status.`,
        },
        { status: 400 }
      );
    }

    // Validate number of children matches booking
    if (children.length !== booking.num_children) {
      return NextResponse.json(
        {
          error: `Expected ${booking.num_children} ${booking.num_children === 1 ? "child" : "children"}, but received ${children.length}`,
        },
        { status: 400 }
      );
    }

    // Run all database operations in a transaction
    const transactionResult = await runTransaction(async () => {
      // Transform children data to database format
      const childRecords: Child[] = children.map((child, index) => ({
        id: `child-${bookingId}-${index}-${Date.now()}`,
        booking_id: bookingId,
        name: child.childName,
        date_of_birth: child.dateOfBirth,
        allergies: child.allergies || "",
        medical_notes: child.medicalNotes || "",
        emergency_contact_name: child.emergencyContactName,
        emergency_contact_phone: child.emergencyContactPhone,
        photo_consent: child.photoConsent,
        activity_consent: child.activityConsent as boolean,
        medical_consent: child.medicalConsent as boolean,
        created_at: new Date().toISOString(),
      }));

      // Save all children to database
      saveChildren(bookingId, childRecords);

      // Update booking status to 'complete'
      const updatedBooking = updateBooking(bookingId, {
        status: "complete",
      });

      if (!updatedBooking) {
        throw new Error("Failed to update booking status");
      }

      return { children: childRecords, booking: updatedBooking };
    });

    if (!transactionResult.success) {
      return NextResponse.json(
        { error: transactionResult.error },
        { status: 500 }
      );
    }

    const { children: savedChildRecords, booking: updatedBooking } = transactionResult.result;

    console.log(
      `[Children API] Successfully completed booking ${bookingId} with ${savedChildRecords.length} children`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully saved information for ${savedChildRecords.length} ${savedChildRecords.length === 1 ? "child" : "children"}`,
      children: savedChildRecords,
      bookingStatus: updatedBooking.status,
    });
  } catch (error) {
    console.error("[Children API] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save children information" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json(
      { error: "Booking ID is required" },
      { status: 400 }
    );
  }

  const booking = getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const children = getChildrenByBookingId(bookingId);

  return NextResponse.json({
    bookingId,
    bookingStatus: booking.status,
    children,
  });
}
