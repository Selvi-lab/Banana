"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OrderTimeline from "@/components/shopping/OrderTimeline";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function readResponse(response) {
    const text = await response.text();
    let result = {};
    try { result = text ? JSON.parse(text) : {}; }
    catch { throw new Error("The server returned an invalid response."); }
    if (!response.ok) {
      throw new Error(result.message || "Unable to load order.");
    }
    return result;
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        const result = await readResponse(response);
        if (active) setData(result);
      } catch (err) {
        if (active && err.message) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (id) load();
    return () => { active = false; };
  }, [id]);

  async function verifyPhone(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = await readResponse(response);
      setData(result);
    } catch (err) {
      setError(err.message || "Order verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-[#f5f1e8] p-10">Loading order...</main>;

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f5f1e8] p-5 py-12">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-7">
          <Link href="/orders" className="text-sm text-[#43553b]">← My Orders</Link>
          <h1 className="mt-5 font-serif text-3xl">Verify your order</h1>
          <p className="mt-3 text-sm text-gray-500">For your privacy, enter the mobile number used when placing order #{id}.</p>
          <form onSubmit={verifyPhone} className="mt-6 space-y-4">
            <input className="w-full rounded-lg border p-3" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric" placeholder="10-digit mobile number" required />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-full bg-[#43553b] p-3 text-white disabled:opacity-60">
              {loading ? "Verifying..." : "View order"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const { order, items = [], tracking = [] } = data;
  const deliveryDate = order.estimated_delivery
    ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : "Date to be confirmed";

  return (
    <main className="min-h-screen bg-[#f5f1e8] p-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/orders" className="text-sm text-[#43553b]">← My Orders</Link>
        <h1 className="my-7 font-serif text-4xl">Track Your Order</h1>
        <section className="mb-5 rounded-xl bg-white p-6">
          <div className="flex flex-wrap justify-between gap-3">
            <div><p className="text-xs text-gray-500">ORDER ID</p><h2 className="text-xl font-bold">#BF{order.id}</h2></div>
            <div><p className="text-xs text-gray-500">ORDER STATUS</p><span className="font-semibold capitalize text-[#43553b]">{String(order.status).replaceAll("-", " ")}</span></div>
          </div>
          <hr className="my-5" />
          <p className="text-xs text-gray-500">ESTIMATED DELIVERY</p>
          <h2 className="mt-2 font-serif text-2xl text-[#43553b]">{deliveryDate}</h2>
          <p className="mt-1 text-xs text-gray-500">Estimated date only; final timing depends on dispatch and courier service.</p>
        </section>
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-xl bg-white p-6">
            <h2 className="mb-6 font-serif text-2xl">Delivery Progress</h2>
            <OrderTimeline status={order.status} />
            <div className="mt-5 border-t pt-5">
              <h3 className="mb-3 font-semibold">Tracking Updates</h3>
              {tracking.length ? tracking.map((event, index) => (
                <div key={`${event.status}-${index}`} className="border-b py-3">
                  <p className="font-medium capitalize">{String(event.status).replaceAll("-", " ")}</p>
                  <p className="text-sm text-gray-500">{event.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(event.created_at).toLocaleString("en-IN")}</p>
                </div>
              )) : <p className="text-sm text-gray-500">Your order is confirmed. Further updates will appear here.</p>}
            </div>
          </section>
          <section className="rounded-xl bg-white p-6">
            <h2 className="mb-5 font-serif text-2xl">Order Items</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 border-b py-4">
                <div><p className="font-medium">{item.product_name}</p><p className="text-xs text-gray-500">Quantity: {item.quantity}</p></div>
                <strong>₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</strong>
              </div>
            ))}
            <div className="flex justify-between py-5 font-bold"><span>Total</span><span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span></div>
            <hr />
            <h3 className="mb-2 mt-5 font-semibold">Delivery Address</h3>
            <p className="text-sm text-gray-500">{order.customer_name}<br />{order.address}<br />{order.city}, {order.state} - {order.pincode}<br />{order.phone}</p>
            <p className="mt-5 text-sm">Payment: {order.payment_method} ({order.payment_status})</p>
          </section>
        </div>
      </div>
    </main>
  );
}
