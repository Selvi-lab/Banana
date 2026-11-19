
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart = [], ready, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPin = localStorage.getItem("banafibre-delivery-pincode");
    if (savedPin && /^\d{6}$/.test(savedPin)) {
      setForm((current) => ({ ...current, pincode: savedPin }));
    }

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setForm((current) => ({
            ...current,
            name: current.name || data.user.name || "",
            email: current.email || data.user.email || "",
            phone: current.phone || data.user.phone || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Safely convert price to number
  const getPrice = (item) => {
    const rawPrice =
      item.price ??
      item.product?.price ??
      item.displayed_price ??
      0;

    const price = Number(
      String(rawPrice).replace(/[₹,\s]/g, "")
    );

    return Number.isFinite(price) && price >= 0 ? price : 0;
  };

  // Safely convert quantity to number
  const getQuantity = (item) => {
    const quantity = Number(item.quantity ?? item.qty ?? 1);

    return Number.isInteger(quantity) && quantity > 0
      ? quantity
      : 1;
  };

  // Calculate subtotal from actual cart products
  const calculatedSubtotal = cart.reduce((sum, item) => {
    return sum + getPrice(item) * getQuantity(item);
  }, 0);

  const subtotal = Number.isFinite(calculatedSubtotal)
    ? calculatedSubtotal
    : 0;

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 60;
  const total = subtotal + shipping;

  function update(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError("");

    if (!ready) {
      setError("Cart is still loading. Please wait.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (subtotal <= 0) {
      setError("Product prices are invalid. Please check your cart.");
      console.error("Invalid cart data:", cart);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    if (cart.some((item) => !item.id || getPrice(item) <= 0)) {
      setError("One or more cart products have invalid details.");
      console.error("Invalid cart products:", cart);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: form,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: getQuantity(item),
          })),
          payment_method: "COD",
        }),
      });

      // Read response safely before parsing JSON
      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Invalid API response:", responseText);
        throw new Error(
          "Server returned an invalid response. Check your orders API."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Order failed. Server status: ${response.status}`
        );
      }

      if (!data.orderId) {
        console.error("Order API response:", data);
        throw new Error("Order ID was not returned by the server.");
      }

      clearCart();

      router.push(
        `/order-success?orderId=${encodeURIComponent(data.orderId)}`
      );
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.message || "Unable to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#f5f1e8] p-10">
        Loading checkout...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] p-5 py-12">
      <div className="max-w-5xl mx-auto">

        <Link href="/cart" className="text-[#657456] text-sm">
          ← Back to cart
        </Link>

        <h1 className="font-serif text-4xl mt-5 mb-8">
          Checkout
        </h1>

        {cart.length === 0 ? (
          <section className="bg-white rounded-xl p-8 text-center">
            <h2 className="font-serif text-2xl mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-5">
              Add products to your cart before checkout.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#43553b] text-white px-7 py-3 rounded-full"
            >
              Continue Shopping
            </Link>
          </section>
        ) : (
          <form
            onSubmit={placeOrder}
            className="grid md:grid-cols-[1fr_330px] gap-8"
          >
            <section className="bg-white rounded-xl p-6 space-y-4">

              <h2 className="font-serif text-2xl mb-5">
                Delivery Address
              </h2>

              {[
                ["name", "Full Name"],
                ["phone", "Mobile Number"],
                ["email", "Email Address"],
                ["address", "House No. / Street Address"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "6-digit PIN Code"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-sm mb-2">
                    {label}
                  </label>

                  <input
                    name={name}
                    value={form[name]}
                    onChange={update}
                    required
                    type={name === "email" ? "email" : "text"}
                    maxLength={
                      name === "phone" || name === "pincode"
                        ? name === "phone" ? 10 : 6
                        : undefined
                    }
                    inputMode={
                      name === "phone" || name === "pincode"
                        ? "numeric"
                        : undefined
                    }
                    className="w-full border border-[#e6dfd2] p-3 rounded-lg outline-none focus:border-[#43553b]"
                  />
                </div>
              ))}

              <h2 className="font-serif text-2xl pt-5">
                Payment Method
              </h2>

              <label className="flex gap-3 border rounded-lg p-4">
                <input type="radio" checked readOnly />

                <span>
                  <strong>Cash on Delivery</strong>
                  <small className="block text-gray-500">
                    Pay when your order arrives.
                  </small>
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !cart.length}
                className="w-full bg-[#43553b] text-white p-4 rounded-full disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </section>

            <aside className="bg-white rounded-xl p-6 h-fit">
              <h2 className="font-serif text-2xl mb-5">
                Order Summary
              </h2>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 py-3 text-sm"
                >
                  <span>
                    {item.name || item.product?.name || "Product"} ×{" "}
                    {getQuantity(item)}
                  </span>

                  <strong>
                    ₹
                    {(
                      getPrice(item) * getQuantity(item)
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}

              <hr className="my-3" />

              <div className="flex justify-between py-2 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 text-sm">
                <span>Delivery</span>
                <span>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
