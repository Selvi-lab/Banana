"use client";

import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/customers", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load customers.");
        setCustomers(data.customers || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="admin-page-heading"><div><span className="admin-eyebrow">CUSTOMER RELATIONSHIPS</span><h1>Customers & Rewards</h1><p>Registered customers and their current loyalty point balance.</p></div></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="admin-panel">
        {loading ? <p>Loading customers...</p> : !customers.length ? <p className="admin-empty">No registered customers yet.</p> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Customer</th><th>Contact</th><th>Joined</th><th>Reward points</th><th>Account</th></tr></thead>
            <tbody>{customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.full_name}<small className="block">#{customer.id}</small></td>
                <td>{customer.email}<small className="block">{customer.phone || "No phone added"}</small></td>
                <td>{new Date(customer.created_at).toLocaleDateString("en-IN")}</td>
                <td>{Number(customer.reward_points || 0)}</td>
                <td>{Number(customer.is_active) ? "Active" : "Disabled"}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </section>
  );
}
