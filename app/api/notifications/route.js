
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

    let notifications;

    if (userId) {
      [notifications] = await db.execute(`
        SELECT * FROM notifications
        WHERE user_id = ? OR user_id IS NULL
        ORDER BY id DESC
        LIMIT 100
      `, [userId]);
    } else {
      [notifications] = await db.query(`
        SELECT * FROM notifications
        ORDER BY id DESC
        LIMIT 100
      `);
    }

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to load notifications",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const {
      user_id = null,
      title,
      message,
      type = "general"
    } = await request.json();

    if (!title || !message) {
      return NextResponse.json({
        success: false,
        message: "Title and message are required"
      }, { status: 400 });
    }

    const db = await getDb();

    const [result] = await db.execute(`
      INSERT INTO notifications (
        user_id, title, message, type, is_read
      )
      VALUES (?, ?, ?, ?, 0)
    `, [
      user_id,
      title,
      message,
      type
    ]);

    return NextResponse.json({
      success: true,
      notificationId: result.insertId,
      message: "Notification created successfully"
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const { id, is_read } = await request.json();

    if (!id || typeof is_read !== "boolean") {
      return NextResponse.json({
        success: false,
        message: "Notification ID and read status required"
      }, { status: 400 });
    }

    const db = await getDb();

    const [result] = await db.execute(`
      UPDATE notifications
      SET is_read = ?
      WHERE id = ?
    `, [is_read ? 1 : 0, id]);

    if (!result.affectedRows) {
      return NextResponse.json({
        success: false,
        message: "Notification not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Notification updated"
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
