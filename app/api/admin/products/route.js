import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const db = getDb();
    const [products] = await db.query("SELECT id, name, category, price, old_price, image, stock, is_active, created_at FROM products ORDER BY id DESC");
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Admin products GET:", error);
    return NextResponse.json({ success: false, message: "Unable to load products." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const body = await request.json();
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock ?? 0);
    if (!name || !category || !Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(stock) || stock < 0) {
      return NextResponse.json({ success: false, message: "Enter a product name, category, valid price and stock quantity." }, { status: 400 });
    }
    const db = getDb();
    const [result] = await db.execute(`
      INSERT INTO products
      (name, category, price, old_price, image, gallery_images, tag, description, material, dimensions, care, stock, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      name, category, price,
      body.old_price === "" || body.old_price == null ? null : Number(body.old_price),
      String(body.image || "/images/placeholder.svg"),
      JSON.stringify([String(body.image || "/images/placeholder.svg")]),
      String(body.tag || ""),
      String(body.description || ""),
      String(body.material || ""),
      String(body.dimensions || ""),
      String(body.care || ""),
      stock,
    ]);
    return NextResponse.json({ success: true, productId: result.insertId, message: "Product created." }, { status: 201 });
  } catch (error) {
    console.error("Admin products POST:", error);
    return NextResponse.json({ success: false, message: "Unable to create product. Check the products table schema." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Administrator sign-in required." }, { status: 401 });
    const { id, stock, is_active } = await request.json();
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0 ||
        (stock !== undefined && (!Number.isSafeInteger(Number(stock)) || Number(stock) < 0)) ||
        (is_active !== undefined && typeof is_active !== "boolean")) {
      return NextResponse.json({ success: false, message: "Invalid product update." }, { status: 400 });
    }
    const db = getDb();
    if (stock !== undefined) await db.execute("UPDATE products SET stock = ? WHERE id = ?", [Number(stock), id]);
    if (is_active !== undefined) await db.execute("UPDATE products SET is_active = ? WHERE id = ?", [is_active ? 1 : 0, id]);
    return NextResponse.json({ success: true, message: "Product updated." });
  } catch (error) {
    console.error("Admin products PATCH:", error);
    return NextResponse.json({ success: false, message: "Unable to update product." }, { status: 500 });
  }
}
