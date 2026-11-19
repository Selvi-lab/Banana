import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attachSessionCookie, verifyPassword } from "@/lib/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
      return NextResponse.json({ success: false, message: "Set AUTH_SECRET in .env.local and restart the development server." }, { status: 503 });
    }
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Enter your email and password." }, { status: 400 });
    }

    const db = getDb();
    const [rows] = await db.execute(
      "SELECT id, full_name, email, phone, password_hash, role, is_active FROM customer_accounts WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];

    if (!user || Number(user.is_active) !== 1 || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ success: false, message: "Email or password is incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      user: { id: Number(user.id), name: user.full_name, email: user.email, phone: user.phone, role: user.role },
    });
    attachSessionCookie(response, user);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Login failed. Check your database setup." }, { status: 500 });
  }
}
