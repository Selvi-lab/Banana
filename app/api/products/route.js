import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseGallery(value, image) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return image ? [image] : [];
}

function normalize(row) {
  const image = row.image || row.image_url || row.product_image || "/images/placeholder.svg";
  return {
    id: String(row.id ?? row.product_id),
    name: row.name || row.product_name || row.title || "BANAFIBRE product",
    category: String(row.category_slug || row.category || row.slug || ""),
    price: Number(row.price ?? row.sale_price ?? row.product_price ?? 0),
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    image,
    galleryImages: parseGallery(row.gallery_images, image),
    tag: row.tag || "",
    description: row.description || "",
    material: row.material || "",
    dimensions: row.dimensions || "",
    care: row.care || "",
    stock: Number(row.stock ?? 0),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    const db = getDb();
    let sql = "SELECT * FROM products";
    const conditions = ["is_active = 1"];
    const values = [];
    if (category) {
      conditions.push("category = ?");
      values.push(category);
    }
    if (query) {
      conditions.push("name LIKE ?");
      values.push(`%${query.slice(0, 100)}%`);
    }
    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    sql += " ORDER BY id DESC";
    const [rows] = await db.execute(sql, values);
    return NextResponse.json({ success: true, products: rows.map(normalize) });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({
      success: false,
      message: "Unable to load products from MySQL. Check your products table columns and database connection.",
    }, { status: 500 });
  }
}
