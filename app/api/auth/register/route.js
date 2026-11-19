import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attachSessionCookie, hashPassword } from "@/lib/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
      return NextResponse.json({ success: false, message: "Set AUTH_SECRET in .env.local and restart the development server." }, { status: 503 });
    }
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ success: false, message: "Enter your full name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ success: false, message: "Password must contain 8–128 characters." }, { status: 400 });
    }

    const db = getDb();
    const passwordHash = hashPassword(password);
    const [result] = await db.execute(
      "INSERT INTO customer_accounts (full_name, email, phone, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'customer', 1)",
      [name, email, phone || null, passwordHash]
    );

    const user = { id: result.insertId };
    const response = NextResponse.json({
      success: true,
      message: "Your BANAFIBRE account has been created.",
      user: { id: result.insertId, name, email, phone: phone || null, role: "customer" },
    }, { status: 201 });
    attachSessionCookie(response, user);
    return response;
  } catch (error) {
    const duplicate = error.code === "ER_DUP_ENTRY";
    console.error("Registration error:", error);
    return NextResponse.json({
      success: false,
      message: duplicate ? "An account with this email already exists." : "Registration failed. Check the customer_accounts table and database connection.",
    }, { status: duplicate ? 409 : 500 });
  }
}
