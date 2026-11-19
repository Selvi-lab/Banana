"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackOrderSearch() {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function track(event) {
    event.preventDefault();
    if (!/^\d+$/.test(id.trim())) {
      setError("Enter the numeric order number from your confirmation.");
      return;
    }
    router.push(`/orders/${id.trim()}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-5">
      <form onSubmit={track} className="bg-white max-w-lg w-full p-8 rounded-2xl">
        <p className="text-xs tracking-widest text-[#78916b]">DELIVERY UPDATES</p>
        <h1 className="font-serif text-3xl mb-3 mt-3">Track your package</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your numeric BANAFIBRE order number. We will ask you to verify the mobile number used at checkout.</p>
        <input value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric" placeholder="Order number" className="w-full border p-4 rounded-lg mb-4" required />
        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        <button className="w-full bg-[#43553b] text-white p-4 rounded-full">Continue</button>
      </form>
    </main>
  );
}
