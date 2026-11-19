import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Always run at request time, never cached at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: "Not available." }, { status: 404 });
  }
  try {
    const [rows] = await getDb().query("SELECT DATABASE() AS database_name");
    return NextResponse.json({
      success: true,
      message: "BANAFIBRE MySQL connected successfully!",
      data: rows,
    });
  } catch (error) {
    console.error("MySQL Error:", error);
    return NextResponse.json({ success: false, message: "Database connection failed" }, { status: 500 });
  }
}
