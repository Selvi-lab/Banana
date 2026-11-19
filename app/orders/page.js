"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders/mine", { cache: "no-store" });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; }
        catch { throw new Error("The server returned an invalid response."); }
        if (!response.ok) throw new Error(data.message || "Unable to load orders.");
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f1e8] p-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-3 font-serif text-4xl">My Orders</h1>
        <p className="mb-8 text-gray-500">Your BANAFIBRE purchases and delivery updates.</p>

        {loading ? <p className="rounded-xl bg-white p-6">Loading your orders...</p> : null}
        {error ? (
          <div className="rounded-xl bg-white p-6">
            <p role="alert" className="text-sm text-amber-800">{error}</p>
            <Link href="/login" className="mt-4 inline-block rounded-full bg-[#43553b] px-6 py-3 text-white">Sign in</Link>
          </div>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center">
            <h2 className="font-serif text-2xl">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-500">Your completed checkouts will appear here.</p>
            <Link href="/shop" className="mt-5 inline-block rounded-full bg-[#43553b] px-6 py-3 text-white">Explore products</Link>
          </div>
        ) : null}

        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-xl bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">ORDER NUMBER</p>
                  <h2 className="font-semibold">#BF{order.id}</h2>
                  <p className="mt-1 text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">STATUS</p>
                  <strong className="capitalize text-[#43553b]">{String(order.status).replaceAll("-", " ")}</strong>
                </div>
                <div>
                  <p className="text-xs text-gray-500">TOTAL</p>
                  <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                </div>
                <Link href={`/orders/${order.id}`} className="rounded-full bg-[#43553b] px-5 py-2 text-sm text-white">Track order</Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-white p-6">
          <h2 className="font-serif text-xl">Looking for a guest order?</h2>
          <p className="mt-2 text-sm text-gray-500">Use your order number and the mobile number entered at checkout.</p>
          <Link href="/track-order" className="mt-3 inline-block text-sm font-semibold text-[#43553b]">Track a guest order →</Link>
        </div>
      </div>
    </main>
  );
}
