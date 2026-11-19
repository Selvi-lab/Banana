"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail, Sprout } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; }
      catch { throw new Error("The server returned an invalid response."); }
      if (!response.ok) throw new Error(data.message || "Unable to sign in.");
      router.push(data.user?.role === "admin" ? "/admin" : "/account");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bana-login-page">
      <Link href="/" className="bana-login-back"><ArrowLeft size={15} /> Back to store</Link>

      <div className="bana-login-shell">
        <section className="bana-login-visual" aria-label="Banana fibre and nature">
          <Image
            src="/images/login-banana-grove.png"
            alt="Sunlit banana tree with a handmade natural fibre basket"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 52vw"
            className="bana-login-photo"
          />
          <div className="bana-login-photo-shade" />
          <div className="bana-login-visual-top">
            <span className="bana-login-mark"><Leaf size={17} /></span>
            <span>GROWN BY NATURE · MADE BY HAND</span>
          </div>
          <div className="bana-login-visual-copy">
            <p className="bana-login-overline"><span /> THE BEAUTY OF NATURAL LIVING</p>
            <h1>Rooted in nature.<br /><em>Woven for life.</em></h1>
            <p>Every little choice can make room for a more thoughtful way of living.</p>
          </div>
          <div className="bana-login-image-caption">
            <Sprout size={16} />
            <span>From banana plant to everyday beauty</span>
            <span className="bana-login-caption-line" />
            <small>01 / 03</small>
          </div>
          <span className="bana-login-vertical-note">NATURAL · CONSCIOUS · TIMELESS</span>
        </section>

        <section className="bana-login-panel">
          <div className="bana-login-panel-inner">
            <Link href="/" className="bana-login-wordmark">Banana<span>fibre</span><i>®</i></Link>
            <div className="bana-login-heading">
              <p className="bana-login-eyebrow">YOUR LITTLE CORNER OF NATURE</p>
              <h2>Welcome <em>back.</em></h2>
              <p>Sign in to continue your journey with thoughtful, handmade living.</p>
            </div>

            <form className="bana-login-form" onSubmit={handleSubmit}>
              <label htmlFor="login-email">Email address</label>
              <div className="bana-login-field">
                <Mail size={17} aria-hidden="true" />
                <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              </div>

              <div className="bana-login-label-row">
                <label htmlFor="login-password">Password</label>
                <Link href="/contact">Need help?</Link>
              </div>
              <div className="bana-login-field">
                <LockKeyhole size={17} aria-hidden="true" />
                <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required />
                <button className="bana-login-eye" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="bana-login-submit disabled:opacity-60">{loading ? "Signing in..." : "Sign in"} <ArrowRight size={17} /></button>
            </form>

            <p className="bana-login-register">New to Banafibre? <Link href="/register">Create an account <ArrowRight size={14} /></Link></p>
            <div className="bana-login-divider"><span /> <Leaf size={14} /> <span /></div>
            <p className="bana-login-footnote">A more mindful everyday starts with a small choice.</p>
            <p className="bana-login-legal">By continuing, you agree to our <Link href="/contact">Terms</Link> and <Link href="/contact">Privacy Policy</Link>.</p>
          </div>
        </section>
      </div>
      <div className="bana-login-bottomline"><span>© BANANAFIBRE</span><span>CRAFTED WITH CARE · INSPIRED BY EARTH</span><span>EST. FOR NATURAL LIVING</span></div>
    </main>
  );
}
