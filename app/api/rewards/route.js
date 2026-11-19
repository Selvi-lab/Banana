
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const db = await getDb();

    if (userId) {
      const [transactions] = await db.execute(`
        SELECT * FROM loyalty_transactions
        WHERE user_id = ?
        ORDER BY id DESC
      `, [userId]);

      const [[balance]] = await db.execute(`
        SELECT COALESCE(SUM(
          CASE
            WHEN transaction_type = 'earn' THEN points
            WHEN transaction_type = 'redeem' THEN -points
            ELSE 0
          END
        ), 0) AS points
        FROM loyalty_transactions
        WHERE user_id = ?
      `, [userId]);

      return NextResponse.json({
        success: true,
        points: Number(balance.points),
        transactions
      });
    }

    const [rewards] = await db.query(`
      SELECT
        user_id,
        SUM(CASE
          WHEN transaction_type = 'earn' THEN points
          WHEN transaction_type = 'redeem' THEN -points
          ELSE 0
        END) AS points
      FROM loyalty_transactions
      GROUP BY user_id
      ORDER BY points DESC
    `);

    return NextResponse.json({
      success: true,
      rewards
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to fetch rewards",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  const db = await getDb();
  const connection = await db.getConnection();

  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const { user_id, order_id } = await request.json();

    if (!user_id || !order_id) {
      return NextResponse.json({
        success: false,
        message: "Customer and order IDs are required"
      }, { status: 400 });
    }

    await connection.beginTransaction();

    const [orders] = await connection.execute(`
      SELECT o.id, ca.id AS user_id, o.total_amount, o.status
      FROM orders o
      INNER JOIN customer_accounts ca
        ON LOWER(ca.email) = LOWER(o.email)
      WHERE o.id = ? AND ca.id = ?
      FOR UPDATE
    `, [order_id, user_id]);

    if (!orders.length) {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 });
    }

    const order = orders[0];

    if (String(order.status).toLowerCase() !== "delivered") {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        message: "Rewards are credited only after delivery"
      }, { status: 400 });
    }

    const [existing] = await connection.execute(`
      SELECT id FROM loyalty_transactions
      WHERE order_id = ? AND transaction_type = 'earn'
    `, [order_id]);

    if (existing.length) {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        message: "Rewards already credited for this order"
      }, { status: 409 });
    }

    const points = Math.floor(Number(order.total_amount) / 100);

    if (points <= 0) {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        message: "Order amount is not eligible for reward points"
      }, { status: 400 });
    }

    await connection.execute(`
      INSERT INTO loyalty_transactions (
        user_id, order_id, points,
        transaction_type, description
      )
      VALUES (?, ?, ?, 'earn', ?)
    `, [
      user_id,
      order_id,
      points,
      `Rewards for order #${order_id}`
    ]);

    await connection.commit();

    return NextResponse.json({
      success: true,
      points,
      message: `${points} reward points credited`
    });

  } catch (error) {
    await connection.rollback();

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });

  } finally {
    connection.release();
  }
}
