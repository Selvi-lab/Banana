"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data";

export default function CartDrawer() {
  const { cart, updateQuantity, removeFromCart, subtotal, ready } = useCart();

  if (!ready) return <div className="card p-5">Loading cart...</div>;

  return (
    <div className="card p-5">
      <h2 className="font-serif text-2xl text-[#183d2b]">Your shopping bag</h2>
      {!cart.length ? (
        <div className="py-10 text-center">
          <p className="muted">Your cart is currently empty.</p>
          <Link className="btn btn-primary mt-5" href="/shop">Continue shopping</Link>
        </div>
      ) : (
        <>
          <div className="mt-5 divide-y">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 py-4">
                <img src={item.image} alt={item.name} className="h-24 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="mt-1">{formatPrice(item.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" className="btn btn-outline !px-3 !py-1"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" className="btn btn-outline !px-3 !py-1"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button type="button" className="text-sm text-red-600" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-5 text-lg font-bold">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <p className="muted mt-2 text-sm">Shipping is calculated at checkout.</p>
          <Link className="btn btn-primary mt-5 w-full" href="/checkout">Continue to checkout</Link>
        </>
      )}
    </div>
  );
}
