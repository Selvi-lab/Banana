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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1", [id]);
    if (!rows.length) return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true, product: normalize(rows[0]) });
  } catch (error) {
    console.error("Product detail API error:", error);
    return NextResponse.json({ success: false, message: "Unable to load this product from MySQL." }, { status: 500 });
  }
}
