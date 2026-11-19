import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

async function loadOrder(id, email = null, phone = null) {
  const db = getDb();
  const [orders] = await db.execute(
    `SELECT id, customer_name, phone, email, address, city, state, pincode,
            total_amount, shipping_charge, payment_method, payment_status,
            status, estimated_delivery, created_at
     FROM orders WHERE id = ? LIMIT 1`,
    [id]
  );
  const order = orders[0];
  if (!order) return null;

  const allowed = email
    ? String(order.email || "").toLowerCase() === email.toLowerCase()
    : phone && String(order.phone) === phone;
  if (!allowed) return null;

  const [items] = await db.execute(
    "SELECT id, product_id, product_name, quantity, price FROM order_items WHERE order_id = ? ORDER BY id ASC",
    [id]
  );
  const [tracking] = await db.execute(
    "SELECT status, description, created_at FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC, id ASC",
    [id]
  );

  return { order, items, tracking };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!/^\d+$/.test(String(id))) {
      return NextResponse.json({ success: false, message: "Invalid order number." }, { status: 400 });
    }
    const user = await getCustomerSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "Sign in or verify your mobile number to view this order." }, { status: 401 });
    }
    const data = await loadOrder(Number(id), user.email, null);
    if (!data) return NextResponse.json({ success: false, message: "Order not found for this account." }, { status: 404 });
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json({ success: false, message: "Unable to load order details. Check the order database tables." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!/^\d+$/.test(String(id))) {
      return NextResponse.json({ success: false, message: "Invalid order number." }, { status: 400 });
    }
    const body = await request.json();
    const phone = String(body.phone || "").trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "Enter the 10-digit mobile number used for this order." }, { status: 400 });
    }
    const data = await loadOrder(Number(id), null, phone);
    if (!data) return NextResponse.json({ success: false, message: "Order number and mobile number do not match." }, { status: 404 });
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Order verification error:", error);
    return NextResponse.json({ success: false, message: "Unable to verify this order." }, { status: 500 });
  }
}
