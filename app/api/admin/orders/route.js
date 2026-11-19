import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

const allowedStatuses = ["confirmed", "packed", "shipped", "out-for-delivery", "delivered", "cancelled"];

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const db = getDb();
    const [orders] = await db.query(`
      SELECT id, customer_name, phone, email, city, state, pincode,
             total_amount, shipping_charge, payment_method, payment_status,
             status, estimated_delivery, created_at
      FROM orders ORDER BY id DESC LIMIT 200
    `);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ success: false, message: "Unable to load orders." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });

    const { id, status, description } = await request.json();
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0 || !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid order ID or status." }, { status: 400 });
    }

    const db = getDb();
    const [result] = await db.execute(
      `UPDATE orders
       SET status = ?,
           payment_status = CASE
             WHEN ? = 'delivered' AND payment_method = 'COD' THEN 'paid'
             ELSE payment_status
           END
       WHERE id = ?`,
      [status, status, id]
    );
    if (!result.affectedRows) return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });

    const messages = {
      confirmed: "Your order has been confirmed.",
      packed: "Your order has been packed.",
      shipped: "Your order has been shipped.",
      "out-for-delivery": "Your order is out for delivery.",
      delivered: "Your order has been delivered.",
      cancelled: "Your order has been cancelled.",
    };
    await db.execute(
      "INSERT INTO order_tracking (order_id, status, description) VALUES (?, ?, ?)",
      [id, status, String(description || messages[status]).slice(0, 1000)]
    );

    return NextResponse.json({ success: true, message: "Order status and tracking timeline updated." });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ success: false, message: "Unable to update order status." }, { status: 500 });
  }
}
