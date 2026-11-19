"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@/data";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [saved, setSaved] = useState(false);
  function toggleWishlist() {
    const current = JSON.parse(
      localStorage.getItem("banafibre-wishlist") || "[]",
    );
    const next = saved
      ? current.filter((id) => id !== product.id)
      : [...new Set([...current, product.id])];
    localStorage.setItem("banafibre-wishlist", JSON.stringify(next));
    setSaved(!saved);
  }
  return (
    <article className="card group relative">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-image transition duration-500 group-hover:scale-105"
          />
        </Link>
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-[#f5ebd7] px-3 py-1 text-xs font-semibold text-[#183d2b]">
            {product.tag}
          </span>
        )}
        <button
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-[#183d2b] shadow"
        >
          <Heart size={17} fill={saved ? "#183d2b" : "none"} />
        </button>
      </div>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-[#26392c]">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <strong>{formatPrice(product.price)}</strong>
          {product.oldPrice && (
            <del className="text-sm text-gray-400">
              {formatPrice(product.oldPrice)}
            </del>
          )}
        </div>
        <Link
          href={`/products/${product.id}`}
          className="mt-4 inline-block text-sm font-semibold text-[#78916b]"
        >
          View product →
        </Link>
      </div>
    </article>
  );
}
