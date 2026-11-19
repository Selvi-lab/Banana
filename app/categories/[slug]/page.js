"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { categories as localCategories, products as localProducts } from "@/data";

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(localCategories.find((item) => item.slug === slug) || null);
  const [products, setProducts] = useState(localProducts.filter((item) => item.category === slug));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch(`/api/products?category=${encodeURIComponent(slug)}`, { cache: "no-store" }),
        ]);
        const [categoryText, productText] = await Promise.all([categoryResponse.text(), productResponse.text()]);
        const categoryData = categoryText ? JSON.parse(categoryText) : {};
        const productData = productText ? JSON.parse(productText) : {};
        if (!categoryResponse.ok || !productResponse.ok) throw new Error("MySQL category data could not be loaded.");
        if (active) {
          setCategory((categoryData.categories || []).find((item) => item.slug === slug) || null);
          setProducts(productData.products || []);
        }
      } catch (error) {
        if (active) setMessage(`${error.message} Showing local preview data.`);
      } finally {
        if (active) setLoading(false);
      }
    }
    setLoading(true);
    load();
    return () => { active = false; };
  }, [slug]);

  if (!category && !loading) {
    return <section className="section container"><h1 className="section-title">Category not found</h1><Link href="/shop">Browse all products</Link></section>;
  }

  return (
    <section className="section container">
      <p className="eyebrow">Shop by category</p>
      <h1 className="section-title">{category?.name || "Loading category..."}</h1>
      <p className="muted mb-8">{category?.description}</p>
      {message && <p role="status" className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
      {loading ? <p>Loading products...</p> : <ProductGrid products={products} />}
    </section>
  );
}
