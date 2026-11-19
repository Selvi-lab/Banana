
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const db = await getDb();

    const [gifts] = await db.query(`
      SELECT * FROM gifts ORDER BY id DESC
    `);

    const [assignedGifts] = await db.query(`
      SELECT
        cg.*,
        u.name AS customer_name,
        u.email AS customer_email
      FROM customer_gifts cg
      LEFT JOIN users u ON u.id = cg.user_id
      ORDER BY cg.id DESC
    `);

    return NextResponse.json({
      success: true,
      gifts,
      assignedGifts
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to fetch gifts",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const {
      user_id,
      gift_id,
      occasion,
      message
    } = await request.json();

    if (!user_id || !gift_id || !occasion) {
      return NextResponse.json({
        success: false,
        message: "Customer, gift and occasion are required"
      }, { status: 400 });
    }

    const db = await getDb();

    const [giftRows] = await db.execute(
      "SELECT id FROM gifts WHERE id = ? AND is_active = 1",
      [gift_id]
    );

    if (!giftRows.length) {
      return NextResponse.json({
        success: false,
        message: "Gift not found or inactive"
      }, { status: 404 });
    }

    const [result] = await db.execute(`
      INSERT INTO customer_gifts (
        user_id, gift_id, occasion, message, status
      )
      VALUES (?, ?, ?, ?, 'assigned')
    `, [
      user_id,
      gift_id,
      occasion,
      message || null
    ]);

    return NextResponse.json({
      success: true,
      giftAssignmentId: result.insertId,
      message: "Gift assigned successfully"
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
