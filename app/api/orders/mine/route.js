import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCustomerSession();
    if (!user) return NextResponse.json({ success: false, message: "Sign in to view your order history." }, { status: 401 });

    const db = getDb();
    const [orders] = await db.execute(`
      SELECT id, total_amount, shipping_charge, payment_method, payment_status,
             status, estimated_delivery, created_at
      FROM orders
      WHERE LOWER(email) = LOWER(?)
      ORDER BY id DESC
      LIMIT 50
    `, [user.email]);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("My orders error:", error);
    return NextResponse.json({ success: false, message: "Unable to load your orders. Check the database setup." }, { status: 500 });
  }
}
