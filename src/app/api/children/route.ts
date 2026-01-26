import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingComplete } from "@/lib/email";

const phoneRegex = /^[\d\s+()-]+$/;

const childSchema = z.object({
  // Child Details
  childName: z.string().min(1, "Child name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Health & Dietary
  hasAllergies: z.boolean().optional(),
  allergies: z.string().optional().default(""),
  hasMedicalConditions: z.boolean().optional(),
  medicalNotes: z.string().optional().default(""),

  // Emergency Contact 1
  emergencyContact1Name: z.string().min(1, "Emergency contact 1 name is required"),
  emergencyContact1Phone: z.string().min(1, "Emergency contact 1 phone is required"),
  emergencyContact1Relationship: z.string().min(1, "Emergency contact 1 relationship is required"),

  // Emergency Contact 2
  emergencyContact2Name: z.string().min(1, "Emergency contact 2 name is required"),
  emergencyContact2Phone: z.string().min(1, "Emergency contact 2 phone is required"),
  emergencyContact2Relationship: z.string().min(1, "Emergency contact 2 relationship is required"),

  // Authorized Pickup Persons (optional)
  pickupPerson1Name: z.string().optional().default(""),
  pickupPerson1Phone: z.string().optional().default(""),
  pickupPerson1Relationship: z.string().optional().default(""),
  pickupPerson2Name: z.string().optional().default(""),
  pickupPerson2Phone: z.string().optional().default(""),
  pickupPerson2Relationship: z.string().optional().default(""),
  pickupPerson3Name: z.string().optional().default(""),
  pickupPerson3Phone: z.string().optional().default(""),
  pickupPerson3Relationship: z.string().optional().default(""),

  // Consents
  photoConsent: z.boolean(),
  activityConsent: z.literal(true, "Activity consent is required"),
  medicalConsent: z.literal(true, "Medical consent is required"),
  farmAnimalConsent: z.literal(true, "Farm animal consent is required"),
  woodlandConsent: z.literal(true, "Woodland consent is required"),

  // Parent Notes
  parentNotes: z.string().optional().default(""),
}).refine((data) => {
  // Validate pickup person phone if name is provided
  if (data.pickupPerson1Name && data.pickupPerson1Phone) {
    return phoneRegex.test(data.pickupPerson1Phone);
  }
  return true;
}, {
  message: "Please enter a valid phone number for pickup person 1",
  path: ["pickupPerson1Phone"],
}).refine((data) => {
  if (data.pickupPerson2Name && data.pickupPerson2Phone) {
    return phoneRegex.test(data.pickupPerson2Phone);
  }
  return true;
}, {
  message: "Please enter a valid phone number for pickup person 2",
  path: ["pickupPerson2Phone"],
}).refine((data) => {
  if (data.pickupPerson3Name && data.pickupPerson3Phone) {
    return phoneRegex.test(data.pickupPerson3Phone);
  }
  return true;
}, {
  message: "Please enter a valid phone number for pickup person 3",
  path: ["pickupPerson3Phone"],
});

const createChildrenRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  children: z.array(childSchema).min(1, "At least one child is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createChildrenRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { bookingId, children } = validation.data;
    const supabase = createAdminClient();

    // Get booking with club details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, clubs(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "paid") {
      return NextResponse.json(
        { error: `Cannot add children to booking with status '${booking.status}'. Booking must be in 'paid' status.` },
        { status: 400 }
      );
    }

    if (children.length !== booking.num_children) {
      return NextResponse.json(
        { error: `Expected ${booking.num_children} ${booking.num_children === 1 ? "child" : "children"}, but received ${children.length}` },
        { status: 400 }
      );
    }

    // Check if children already exist for this booking
    const { data: existingChildren } = await supabase
      .from('children')
      .select('id')
      .eq('booking_id', bookingId);

    if (existingChildren && existingChildren.length > 0) {
      return NextResponse.json(
        { error: "Children information has already been submitted for this booking" },
        { status: 400 }
      );
    }

    // Insert children with all new fields
    const childRecords = children.map((child) => ({
      booking_id: bookingId,
      name: child.childName,
      date_of_birth: child.dateOfBirth,
      allergies: child.allergies || "",
      medical_notes: child.medicalNotes || "",

      // Emergency Contact 1
      emergency_contact_name: child.emergencyContact1Name,
      emergency_contact_phone: child.emergencyContact1Phone,
      emergency_contact_relationship: child.emergencyContact1Relationship,

      // Emergency Contact 2
      emergency_contact_2_name: child.emergencyContact2Name,
      emergency_contact_2_phone: child.emergencyContact2Phone,
      emergency_contact_2_relationship: child.emergencyContact2Relationship,

      // Authorized Pickup Persons
      pickup_person_1_name: child.pickupPerson1Name || null,
      pickup_person_1_phone: child.pickupPerson1Phone || null,
      pickup_person_1_relationship: child.pickupPerson1Relationship || null,
      pickup_person_2_name: child.pickupPerson2Name || null,
      pickup_person_2_phone: child.pickupPerson2Phone || null,
      pickup_person_2_relationship: child.pickupPerson2Relationship || null,
      pickup_person_3_name: child.pickupPerson3Name || null,
      pickup_person_3_phone: child.pickupPerson3Phone || null,
      pickup_person_3_relationship: child.pickupPerson3Relationship || null,

      // Consents
      photo_consent: child.photoConsent,
      activity_consent: child.activityConsent,
      medical_consent: child.medicalConsent,
      farm_animal_consent: child.farmAnimalConsent,
      woodland_consent: child.woodlandConsent,

      // Parent Notes
      parent_notes: child.parentNotes || null,
    }));

    const { data: savedChildren, error: childrenError } = await supabase
      .from('children')
      .insert(childRecords)
      .select();

    if (childrenError) {
      console.error("[Children API] Insert error:", childrenError);
      return NextResponse.json({ error: "Failed to save children information" }, { status: 500 });
    }

    // Update booking status to 'complete'
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'complete' })
      .eq('id', bookingId);

    if (updateError) {
      console.error("[Children API] Update booking error:", updateError);
      return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
    }

    // Send completion email
    if (booking.clubs) {
      try {
        await sendBookingComplete(booking, booking.clubs, savedChildren || []);
        console.log(`[Children API] Sent completion email to ${booking.parent_email}`);
      } catch (emailError) {
        console.error("[Children API] Failed to send completion email:", emailError);
      }
    }

    console.log(`[Children API] Successfully completed booking ${bookingId} with ${savedChildren?.length} children`);

    return NextResponse.json({
      success: true,
      message: `Successfully saved information for ${savedChildren?.length} ${savedChildren?.length === 1 ? "child" : "children"}`,
      children: savedChildren,
      bookingStatus: 'complete',
    });
  } catch (error) {
    console.error("[Children API] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to save children information" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('booking_id', bookingId);

  return NextResponse.json({
    bookingId,
    bookingStatus: booking.status,
    children: children || [],
  });
}
