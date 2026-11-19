"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <section className="section container">
      <p className="eyebrow">Your BANANAFIBRE</p>
      <h1 className="section-title">My account</h1>
      {loading ? <p className="muted mt-5">Loading account...</p> : null}
      {!loading && user ? (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="font-serif text-2xl text-[#183d2b]">{user.name}</h2>
            <p className="muted mt-1">{user.email}</p>
            {user.phone ? <p className="muted mt-1">{user.phone}</p> : null}
          </div>
          <button onClick={logout} className="btn btn-outline">
            Sign out
          </button>
        </div>
      ) : !loading ? (
        <div className="card mt-6 p-6">
          <p className="muted">
            Sign in to view your account and order history.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-outline">
              Create account
            </Link>
          </div>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Orders", "View your purchases", "/orders"],
          ["Wishlist", "See saved products", "/wishlist"],
          ["Track an order", "Check delivery progress", "/track-order"],
        ].map(([title, description, href]) => (
          <Link href={href} key={href} className="card p-6">
            <h2 className="font-serif text-2xl text-[#183d2b] text-color=black">{title}</h2>
            <p className="muted mt-2">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
