
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check } from "lucide-react";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    setAdded(true);

    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 w-full rounded-full bg-[#43553b] text-white px-5 py-3 hover:bg-[#293a2b] transition"
    >
      {added ? <Check size={18} /> : <ShoppingBag size={18} />}
      {added ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}
