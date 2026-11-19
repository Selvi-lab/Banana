import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

const stages = {
  confirmed: "Your order has been confirmed.",
  packed: "Your order has been packed.",
  shipped: "Your order has been shipped.",
  "out-for-delivery": "Your order is out for delivery.",
  delivered: "Your order has been delivered.",
  cancelled: "Your order has been cancelled.",
};

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });

    const { id } = await params;
    if (!/^\d+$/.test(String(id))) return NextResponse.json({ success: false, message: "Invalid order ID." }, { status: 400 });

    const body = await request.json();
    const { status, description } = body;
    if (!stages[status]) return NextResponse.json({ success: false, message: "Invalid tracking status." }, { status: 400 });

    const db = getDb();
    const [orders] = await db.execute("SELECT id FROM orders WHERE id = ?", [id]);
    if (!orders.length) return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });

    await db.execute(
      "INSERT INTO order_tracking (order_id, status, description) VALUES (?, ?, ?)",
      [id, status, String(description || stages[status]).slice(0, 1000)]
    );
    await db.execute(
      `UPDATE orders SET status = ?,
       payment_status = CASE
         WHEN ? = 'delivered' AND payment_method = 'COD' THEN 'paid'
         ELSE payment_status
       END
       WHERE id = ?`,
      [status, status, id]
    );

    return NextResponse.json({ success: true, message: "Order tracking updated." });
  } catch (error) {
    console.error("Tracking update error:", error);
    return NextResponse.json({ success: false, message: "Unable to update tracking." }, { status: 500 });
  }
}
