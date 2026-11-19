import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC");
    const categories = rows.map((row) => ({
      id: row.id,
      name: row.name || row.title,
      slug: row.slug || row.category_slug,
      image: row.image || row.image_url || "/images/placeholder.svg",
      description: row.description || "",
    }));
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ success: false, message: "Unable to load categories from MySQL." }, { status: 500 });
  }
}
