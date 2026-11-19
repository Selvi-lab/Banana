
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const db = await getDb();

    const [coupons] = await db.query(
      "SELECT * FROM coupons ORDER BY id DESC"
    );

    return NextResponse.json({
      success: true,
      coupons
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to fetch coupons",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const body = await request.json();

    const {
      code,
      discount_type,
      discount_value,
      collection_id = null,
      min_order_amount = 0,
      max_discount = null,
      start_date,
      end_date,
      usage_limit = null
    } = body;

    if (
      !code ||
      !["percentage", "fixed"].includes(discount_type) ||
      !Number.isFinite(Number(discount_value)) ||
      Number(discount_value) <= 0
    ) {
      return NextResponse.json({
        success: false,
        message: "Invalid coupon details"
      }, { status: 400 });
    }

    if (
      discount_type === "percentage" &&
      Number(discount_value) > 100
    ) {
      return NextResponse.json({
        success: false,
        message: "Percentage discount cannot exceed 100"
      }, { status: 400 });
    }

    if (!Number.isFinite(Number(min_order_amount)) || Number(min_order_amount) < 0 ||
        (max_discount !== "" && max_discount != null && (!Number.isFinite(Number(max_discount)) || Number(max_discount) < 0)) ||
        (usage_limit !== "" && usage_limit != null && (!Number.isSafeInteger(Number(usage_limit)) || Number(usage_limit) < 1))) {
      return NextResponse.json({ success: false, message: "Enter valid minimum order, maximum discount and usage limit values." }, { status: 400 });
    }

    if (!start_date || !end_date ||
        Number.isNaN(new Date(start_date).getTime()) ||
        Number.isNaN(new Date(end_date).getTime()) ||
        new Date(end_date) <= new Date(start_date)) {
      return NextResponse.json({
        success: false,
        message: "Enter valid coupon dates"
      }, { status: 400 });
    }

    const db = await getDb();

    const [result] = await db.execute(`
      INSERT INTO coupons (
        code, discount_type, discount_value,
        collection_id, min_order_amount, max_discount,
        start_date, end_date, usage_limit,
        used_count, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
    `, [
      code.trim().toUpperCase(),
      discount_type,
      Number(discount_value),
      collection_id,
      Number(min_order_amount),
      max_discount === "" || max_discount == null ? null : Number(max_discount),
      start_date,
      end_date,
      usage_limit === "" || usage_limit == null ? null : Number(usage_limit)
    ]);

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      couponId: result.insertId
    }, { status: 201 });

  } catch (error) {
    const duplicate = error.code === "ER_DUP_ENTRY";
    return NextResponse.json({
      success: false,
      message: duplicate ? "Coupon code already exists" : "Coupon creation failed",
    }, { status: duplicate ? 409 : 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const { id, is_active } = await request.json();

    if (!id || typeof is_active !== "boolean") {
      return NextResponse.json({
        success: false,
        message: "Coupon ID and active status required"
      }, { status: 400 });
    }

    const db = await getDb();

    const [result] = await db.execute(
      "UPDATE coupons SET is_active = ? WHERE id = ?",
      [is_active ? 1 : 0, id]
    );

    if (!result.affectedRows) {
      return NextResponse.json({
        success: false,
        message: "Coupon not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Coupon status updated"
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
