import { NextRequest, NextResponse } from "next/server";
import type { ChildInsert } from "@/types/database";

interface ChildFormData {
  childName: string;
  dateOfBirth: string;
  allergies?: string;
  medicalNotes?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  photoConsent: boolean;
  activityConsent: boolean;
  medicalConsent: boolean;
}

interface CreateChildrenRequest {
  bookingId: string;
  children: ChildFormData[];
}

// In-memory store for mock data (in production, this would be a database)
const savedChildren: Map<string, ChildInsert[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: CreateChildrenRequest = await request.json();

    const { bookingId, children } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    if (!children || !Array.isArray(children) || children.length === 0) {
      return NextResponse.json(
        { error: "Children data is required" },
        { status: 400 }
      );
    }

    // Validate each child's data
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.childName || !child.dateOfBirth || !child.emergencyContactName || !child.emergencyContactPhone) {
        return NextResponse.json(
          { error: `Missing required fields for child ${i + 1}` },
          { status: 400 }
        );
      }
      if (!child.activityConsent || !child.medicalConsent) {
        return NextResponse.json(
          { error: `Required consents not given for child ${i + 1}` },
          { status: 400 }
        );
      }
    }

    // Transform and save children data
    const childRecords: ChildInsert[] = children.map((child, index) => ({
      id: `child-${bookingId}-${index}-${Date.now()}`,
      booking_id: bookingId,
      name: child.childName,
      date_of_birth: child.dateOfBirth,
      allergies: child.allergies || "",
      medical_notes: child.medicalNotes || "",
      emergency_contact_name: child.emergencyContactName,
      emergency_contact_phone: child.emergencyContactPhone,
      photo_consent: child.photoConsent,
      activity_consent: child.activityConsent,
      medical_consent: child.medicalConsent,
      created_at: new Date().toISOString(),
    }));

    // In production, this would save to the database
    // For now, we store in memory
    savedChildren.set(bookingId, childRecords);

    // Log for development
    console.log(`Saved ${childRecords.length} children for booking ${bookingId}:`, childRecords);

    return NextResponse.json({
      success: true,
      message: `Successfully saved information for ${children.length} ${children.length === 1 ? "child" : "children"}`,
      children: childRecords,
    });
  } catch (error) {
    console.error("Error saving children:", error);
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

  const children = savedChildren.get(bookingId) || [];

  return NextResponse.json({
    bookingId,
    children,
  });
}
