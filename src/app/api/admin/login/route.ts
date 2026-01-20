import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Mock credentials check - replace with real auth later
  if (
    email === "admin@exploretheclubhouse.co.uk" &&
    password === "admin123"
  ) {
    const response = NextResponse.json({ success: true });

    // Set the admin session cookie
    response.cookies.set("admin-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  );
}
