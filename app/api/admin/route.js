
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const db = await getDb();

    const [[sales]] = await db.query(`
      SELECT
        COALESCE(SUM(
          CASE
            WHEN LOWER(status) = 'delivered' OR LOWER(payment_status) = 'paid'
            THEN total_amount ELSE 0
          END
        ), 0) AS revenue,
        COUNT(*) AS totalOrders
      FROM orders
    `);

    const [[customers]] = await db.query(`
      SELECT COUNT(*) AS totalCustomers FROM customer_accounts
    `);

    const [[products]] = await db.query(`
      SELECT COUNT(*) AS totalProducts FROM products
    `);

    const [recentOrders] = await db.query(`
      SELECT
        o.id,
        o.customer_name,
        o.total_amount,
        o.status
      FROM orders o
      ORDER BY o.id DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      revenue: Number(sales.revenue),
      totalOrders: Number(sales.totalOrders),
      totalCustomers: Number(customers.totalCustomers),
      totalProducts: Number(products.totalProducts),
      recentOrders
    });

  } catch (error) {
    console.error("Admin API:", error);

    return NextResponse.json({
      success: false,
      message: "Unable to load admin dashboard",
      error: error.message
    }, { status: 500 });
  }
}
