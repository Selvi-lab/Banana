import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCustomerSession();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json({ success: false, user: null, message: "Unable to check session." }, { status: 500 });
  }
}
