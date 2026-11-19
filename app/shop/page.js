"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import { products as localProducts } from "@/data";

function ShopContent() {
  const params = useSearchParams();
  const [catalog, setCatalog] = useState(localProducts);
  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState("all");
  const [databaseMessage, setDatabaseMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const query = params.get("q") || "";

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; }
        catch { throw new Error("Invalid response from products API."); }
        if (!response.ok) throw new Error(data.message || "MySQL products could not be loaded.");
        if (active && Array.isArray(data.products)) {
          setCatalog(data.products);
          setDatabaseMessage("");
        }
      } catch (error) {
        if (active) setDatabaseMessage(`${error.message} Showing the local preview catalogue.`);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProducts();
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => {
    let list = catalog.filter((product) =>
      (category === "all" || product.category === category) &&
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [catalog, category, sort, query]);

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">The BANAFIBRE collection</p>
        <h1 className="section-title">Shop all products</h1>
        {databaseMessage && <p role="status" className="my-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{databaseMessage}</p>}
        <div className="my-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchBar />
          <div className="flex gap-2">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              <option value="bags">Bags</option>
              <option value="home-living">Home & Living</option>
              <option value="accessories">Accessories</option>
              <option value="gifting">Gifting</option>
            </select>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
        <p className="muted mb-5">{loading ? "Loading products..." : `${visible.length} products`}</p>
        {visible.length ? <ProductGrid products={visible} /> : !loading ? <p className="card p-8">No products found in this collection.</p> : null}
      </div>
    </section>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<section className="section"><div className="container">Loading shop...</div></section>}><ShopContent /></Suspense>;
}
