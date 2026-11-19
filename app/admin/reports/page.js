{/*import AdminSection from "@/components/admin/AdminSection";

export default function ReportsPage() {
  return <AdminSection title="Store Reports" description="Track sales performance, revenue trends and store growth." columns={["Report", "Period", "Orders", "Revenue", "Status"]} rows={[
    ["Weekly Sales", "Last 7 days", "126", "₹48,650", "Ready"],
    ["Monthly Sales", "October 2026", "428", "₹1,82,400", "Ready"],
    ["Customer Growth", "October 2026", "98", "—", "Ready"]
  ]} />;
}
*/}


import AdminSection from "@/components/admin/AdminSection";

export default function ReportsPage() {
  return (
    <AdminSection
      title="Business Reports"
      description="Monitor sales, orders, customers and product performance."
    >
      <p>Sales and business analytics.</p>
    </AdminSection>
  );
}
