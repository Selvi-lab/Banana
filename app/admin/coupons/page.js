"use client";

import { useEffect, useState } from "react";

const emptyCoupon = { code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", max_discount: "", start_date: "", end_date: "", usage_limit: "" };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyCoupon);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/coupons", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load coupons.");
      setCoupons(data.coupons || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create coupon.");
      setMessage(data.message); setForm(emptyCoupon); await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggle(coupon) {
    try {
      const response = await fetch("/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, is_active: !Boolean(coupon.is_active) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update coupon.");
      await load();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="space-y-6">
      <div className="admin-page-heading"><div><span className="admin-eyebrow">PROMOTIONS</span><h1>Coupons & Offers</h1><p>Create discount codes and manage campaign dates.</p></div></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      <form onSubmit={create} className="admin-panel grid gap-3 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">Create coupon</h2>
        <input required placeholder="Coupon code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed amount (₹)</option></select>
        <input required type="number" min="1" step="0.01" placeholder="Discount value" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
        <input type="number" min="0" step="0.01" placeholder="Minimum order amount" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
        <input type="number" min="0" step="0.01" placeholder="Maximum discount (optional)" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} />
        <input type="number" min="1" step="1" placeholder="Usage limit (optional)" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
        <label className="text-sm">Start date<input className="mt-1 block w-full" required type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
        <label className="text-sm">End date<input className="mt-1 block w-full" required type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
        <button disabled={saving} className="outline-admin-btn md:col-span-2 disabled:opacity-50">{saving ? "Creating..." : "Create coupon"}</button>
      </form>
      <div className="admin-panel">
        <h2 className="mb-4 text-lg font-semibold">Active and past coupons</h2>
        {loading ? <p>Loading coupons...</p> : !coupons.length ? <p className="admin-empty">No coupons created yet.</p> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Code</th><th>Discount</th><th>Validity</th><th>Usage</th><th>Status</th></tr></thead>
            <tbody>{coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td><strong>{coupon.code}</strong><small className="block">Min. ₹{Number(coupon.min_order_amount).toLocaleString("en-IN")}</small></td>
                <td>{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
                <td>{new Date(coupon.start_date).toLocaleDateString("en-IN")} – {new Date(coupon.end_date).toLocaleDateString("en-IN")}</td>
                <td>{coupon.used_count || 0}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}</td>
                <td><button onClick={() => toggle(coupon)} className="text-[#526c43] underline">{Number(coupon.is_active) ? "Active — pause" : "Paused — activate"}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </section>
  );
}
