import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/customer-auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out." });
  clearSessionCookie(response);
  return response;
}
