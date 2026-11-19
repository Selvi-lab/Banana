"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const statuses = ["confirmed", "packed", "shipped", "out-for-delivery", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; }
      catch { throw new Error("Invalid response from orders API."); }
      if (!response.ok) throw new Error(data.message || "Unable to load orders.");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    setSaving(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update status.");
      await load();
    } catch (err) {
      setError(err.message || "Could not update order.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">FULFILMENT</span><h1>Order Management</h1><p>Review customer orders and update delivery progress.</p></div>
        <button onClick={load} className="outline-admin-btn">Refresh orders</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="admin-panel">
        {loading ? <p className="admin-empty">Loading orders...</p> : !orders.length ? <p className="admin-empty">No customer orders yet.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Tracking</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong><small className="block">{new Date(order.created_at).toLocaleDateString("en-IN")}</small></td>
                    <td>{order.customer_name}<small className="block">{order.phone}</small></td>
                    <td>₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                    <td>{order.payment_method}<small className="block">{order.payment_status}</small></td>
                    <td>
                      <select aria-label={`Update status for order ${order.id}`} value={order.status} disabled={saving === order.id}
                        onChange={(event) => updateStatus(order.id, event.target.value)}>
                        {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("-", " ")}</option>)}
                      </select>
                    </td>
                    <td><Link href={`/orders/${order.id}`} target="_blank" className="text-[#526c43] underline">Preview</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
