import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getCustomerSession } from "@/lib/customer-auth";
import "./admin.css";

export const metadata = {
  title: "BANAFIBRE | Admin Dashboard",
  description: "BANAFIBRE store administration",
};

export default async function AdminLayout({ children }) {
  let user = null;
  try { user = await getCustomerSession(); } catch {}
  if (!user || user.role !== "admin") redirect("/login?next=/admin");

  return <AdminShell>{children}</AdminShell>;
}
