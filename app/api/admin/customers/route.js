import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const db = getDb();
    const [customers] = await db.query(`
      SELECT ca.id, ca.full_name, ca.email, ca.phone, ca.role, ca.is_active, ca.created_at,
        COALESCE(SUM(CASE
          WHEN lt.transaction_type = 'earn' THEN lt.points
          WHEN lt.transaction_type = 'redeem' THEN -lt.points
          ELSE 0 END), 0) AS reward_points
      FROM customer_accounts ca
      LEFT JOIN loyalty_transactions lt ON lt.user_id = ca.id
      GROUP BY ca.id
      ORDER BY ca.id DESC
      LIMIT 500
    `);
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Admin customers error:", error);
    return NextResponse.json({ success: false, message: "Unable to load customers." }, { status: 500 });
  }
}
