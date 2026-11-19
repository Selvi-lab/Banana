"use client";
import { useState } from "react";
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(
          "Thanks! Connect this form to your mailing-list service to save subscriptions.",
        );
      }}
    >
      <input
        className="input"
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn btn-primary shrink-0">Subscribe</button>
      {message && (
        <p className="basis-full text-sm text-[#183d2b]">{message}</p>
      )}
    </form>
  );
}
