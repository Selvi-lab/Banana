import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));

export async function POST(request) {
  let connection;
  let transactionStarted = false;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid request body. Please submit the order again." }, { status: 400 });
    }

    const customer = body?.customer || {};
    const items = body?.items;
    const paymentMethod = body?.payment_method;

    const name = String(customer.name || "").trim();
    const phone = String(customer.phone || "").trim();
    const email = String(customer.email || "").trim().toLowerCase();
    const address = String(customer.address || "").trim();
    const city = String(customer.city || "").trim();
    const state = String(customer.state || "").trim();
    const pincode = String(customer.pincode || "").trim();

    if (!name || !phone || !email || !address || !city || !state || !pincode) {
      return NextResponse.json({ success: false, message: "Complete all delivery details, including email, city and state." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{6}$/.test(pincode) || !validEmail(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email, 10-digit Indian mobile number and 6-digit PIN code." }, { status: 400 });
    }
    let signedInCustomer = null;
    try { signedInCustomer = await getCustomerSession(); } catch {}
    if (signedInCustomer && signedInCustomer.email.toLowerCase() !== email) {
      return NextResponse.json({ success: false, message: "Use the email address linked to your signed-in BANAFIBRE account." }, { status: 400 });
    }
    if (!Array.isArray(items) || !items.length || items.length > 50) {
      return NextResponse.json({ success: false, message: "Your cart is empty or contains too many different products." }, { status: 400 });
    }
    if (paymentMethod !== "COD") {
      return NextResponse.json({ success: false, message: "Only Cash on Delivery is currently enabled." }, { status: 400 });
    }

    const quantities = new Map();
    for (const item of items) {
      const id = Number(item.product_id);
      const quantity = Number(item.quantity);
      if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
        return NextResponse.json({ success: false, message: "A cart item has an invalid product ID or quantity." }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const db = getDb();
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const ids = [...quantities.keys()];
    const placeholders = ids.map(() => "?").join(",");
    const [productRows] = await connection.query(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
      ids
    );

    if (productRows.length !== ids.length) {
      throw new Error("One or more products are no longer available. Refresh your cart.");
    }

    let subtotal = 0;
    const orderItems = productRows.map((product) => {
      const quantity = quantities.get(Number(product.id));
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error(`${product.name}: invalid product price.`);
      if (Number(product.stock) < quantity) throw new Error(`${product.name} does not have enough stock.`);
      subtotal += price * quantity;
      return { id: product.id, name: product.name, price, quantity };
    });

    const shipping = subtotal >= 999 ? 0 : 60;
    const total = subtotal + shipping;

    const [orderResult] = await connection.execute(`
      INSERT INTO orders (
        customer_name, phone, email, address, city, state, pincode,
        total_amount, shipping_charge, payment_method, payment_status,
        status, estimated_delivery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'COD', 'pending', 'confirmed',
        DATE_ADD(CURDATE(), INTERVAL 7 DAY))
    `, [name, phone, email, address, city, state, pincode, total, shipping]);

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.execute(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.id, item.name, item.quantity, item.price]);

      await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.id]
      );
    }

    await connection.execute(`
      INSERT INTO order_tracking (order_id, status, description)
      VALUES (?, 'confirmed', 'Your BANAFIBRE order has been confirmed.')
    `, [orderId]);

    await connection.commit();
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      orderId,
      total,
      subtotal,
      shipping,
      estimatedDeliveryDays: "5–7 business days",
      message: "Your BANAFIBRE order has been placed!"
    }, { status: 201 });

  } catch (error) {
    if (connection && transactionStarted) {
      try { await connection.rollback(); } catch {}
    }
    console.error("Place order error:", error);
    return NextResponse.json({
      success: false,
      message: error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_BAD_FIELD_ERROR"
        ? "Your MySQL order schema is incomplete. Run the supplied database setup SQL and verify the products/orders columns."
        : (error.message || "Unable to place your order.")
    }, { status: 500 });
  } finally {
    connection?.release();
  }
}
