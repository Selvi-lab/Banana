"use client";

import { useEffect, useState } from "react";

const initial = { name: "", category: "bags", price: "", old_price: "", stock: "100", image: "", tag: "", description: "", material: "", dimensions: "", care: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load products.");
      setProducts(data.products || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createProduct(event) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Product could not be created.");
      setMessage(data.message);
      setForm(initial);
      await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggleActive(product) {
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, is_active: !Boolean(product.is_active) }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Could not update product."); return; }
    await load();
  }

  return (
    <section className="space-y-6">
      <div className="admin-page-heading"><div><span className="admin-eyebrow">CATALOGUE</span><h1>Products</h1><p>Add products and manage stock visibility.</p></div></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      <form onSubmit={createProduct} className="admin-panel grid gap-3 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">Add a product</h2>
        <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="bags">Bags & Totes</option><option value="home-living">Home & Living</option><option value="accessories">Accessories</option><option value="gifting">Gifting</option>
        </select>
        <input required type="number" min="1" step="0.01" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" min="0" step="0.01" placeholder="Old price (optional)" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} />
        <input required type="number" min="0" step="1" placeholder="Stock quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input placeholder="Image path, e.g. /products/new.png" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <input placeholder="Tag (optional)" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
        <input placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
        <input placeholder="Dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
        <textarea className="md:col-span-2" placeholder="Product description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea className="md:col-span-2" placeholder="Care instructions" value={form.care} onChange={(e) => setForm({ ...form, care: e.target.value })} />
        <button disabled={saving} className="outline-admin-btn md:col-span-2 disabled:opacity-50">{saving ? "Saving..." : "Add product"}</button>
      </form>
      <div className="admin-panel">
        <h2 className="mb-4 text-lg font-semibold">Product inventory</h2>
        {loading ? <p>Loading products...</p> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th></tr></thead>
            <tbody>{products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<small className="block">#{product.id}</small></td>
                <td>{product.category}</td><td>₹{Number(product.price).toLocaleString("en-IN")}</td>
                <td>{product.stock}</td>
                <td><button onClick={() => toggleActive(product)} className="text-[#526c43] underline">{Number(product.is_active) ? "Active — hide" : "Hidden — show"}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </section>
  );
}
