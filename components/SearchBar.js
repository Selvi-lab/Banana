"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/shop?q=${encodeURIComponent(query)}`);
      }}
      className="flex w-full max-w-md gap-2"
    >
      <div className="relative flex-1">
        <Search size={17} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          className="input pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search natural products..."
        />
      </div>
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
}
