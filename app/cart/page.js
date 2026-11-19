"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 60;

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function CartPage() {
  const { cart, ready, subtotal, updateQuantity, removeFromCart } = useCart();

  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_LIMIT ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  if (!ready) {
    return <section className="section"><div className="container">Loading your shopping bag...</div></section>;
  }

  return (
    <section className="min-h-screen bg-[#f5f1e8] py-8">
      <div className="container mx-auto max-w-6xl px-5">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[#526c43] mb-6">
          <ArrowLeft size={16} /> Continue shopping
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#183d2b]">Your Shopping Bag</h1>
          <span className="text-sm text-[#526c43]">{cart.length} Products</span>
        </div>

        {!cart.length ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ShoppingBag size={55} className="mx-auto text-[#526c43] mb-5" />
            <h2 className="font-serif text-2xl text-[#183d2b]">Your bag is empty</h2>
            <p className="text-gray-500 mt-3">Discover our sustainable banana fibre products.</p>
            <Link href="/shop" className="btn btn-primary inline-flex items-center gap-2 mt-7">
              Explore Products <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <div className="lg:col-span-2 space-y-5">
              {cart.map((item) => (
                <article key={item.id} className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
                  <img
                    src={item.image || "/images/placeholder.svg"}
                    alt={item.name}
                    onError={(event) => { event.currentTarget.src = "/images/placeholder.svg"; }}
                    className="w-28 h-28 object-cover rounded-xl bg-[#f5f1e8]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="font-serif text-xl text-[#183d2b]">{item.name}</h2>
                        <p className="text-[#526c43] mt-2">{formatPrice(item.price)}</p>
                      </div>
                      <strong className="text-[#183d2b]">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1} aria-label="Decrease quantity"
                          className="w-9 h-9 border rounded-full flex items-center justify-center disabled:opacity-40">
                          <Minus size={16} />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity" className="w-9 h-9 border rounded-full flex items-center justify-center">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700" aria-label={`Remove ${item.name}`}>
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="bg-white rounded-2xl p-6 h-fit">
              <h2 className="font-serif text-2xl text-[#183d2b] mb-7">Price Details</h2>
              <div className="space-y-5">
                <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                <div className="flex justify-between text-sm"><span>Delivery</span><strong>{delivery === 0 ? "FREE" : formatPrice(delivery)}</strong></div>
                <p className="text-xs text-[#8a8a70]">
                  {subtotal >= FREE_DELIVERY_LIMIT
                    ? "Congratulations! You have free delivery."
                    : `Free delivery on orders above ₹${FREE_DELIVERY_LIMIT}.`}
                </p>
                <div className="border-t pt-5 flex justify-between font-semibold">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn btn-primary w-full mt-6 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-center text-gray-500 mt-4">Secure checkout • Sustainable shopping</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
