"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; }
      catch { throw new Error("The server returned an invalid response."); }
      if (!response.ok) throw new Error(data.message || "Unable to create account.");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-7 shadow-sm md:p-9">
        <Link href="/" className="text-sm text-[#526c43]">← Back to store</Link>
        <p className="eyebrow mt-7">Create your account</p>
        <h1 className="section-title !text-4xl">Join BANAFIBRE</h1>
        <p className="mt-3 text-sm text-gray-500">Save your details and follow your orders in one place.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm">Full name
            <input className="input mt-2 w-full" name="name" value={form.name} onChange={update} autoComplete="name" required minLength={2} />
          </label>
          <label className="block text-sm">Email address
            <input className="input mt-2 w-full" name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
          </label>
          <label className="block text-sm">Mobile number (optional)
            <input className="input mt-2 w-full" name="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={update} autoComplete="tel" />
          </label>
          <label className="block text-sm">Create password
            <input className="input mt-2 w-full" name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" required minLength={8} />
          </label>
          <label className="block text-sm">Confirm password
            <input className="input mt-2 w-full" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} autoComplete="new-password" required minLength={8} />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link className="font-semibold text-[#526c43]" href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
