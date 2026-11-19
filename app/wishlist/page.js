"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { products as localProducts } from "@/data";

export default function WishlistPage() {
  const [saved, setSaved] = useState([]);
  const [catalog, setCatalog] = useState(localProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("banafibre-wishlist") || "[]");
      setSaved(Array.isArray(stored) ? stored.map(String) : []);
    } catch {
      setSaved([]);
    }

    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.products)) setCatalog(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const savedProducts = catalog.filter((product) => saved.includes(String(product.id)));

  return (
    <section className="section container">
      <p className="eyebrow">Your saved collection</p>
      <h1 className="section-title">Wishlist</h1>
      {loading ? <p>Loading wishlist...</p> : savedProducts.length ? <ProductGrid products={savedProducts} /> : (
        <div className="card p-8">
          <p className="muted">Your wishlist is empty. Save products you would like to revisit.</p>
        </div>
      )}
    </section>
  );
}
