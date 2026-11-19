"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, Heart, Menu, X, UserRound } from "lucide-react";
import { useCart } from "@/context/CartContext";

const links = [
  ["Shop", "/shop"],
  ["Our Story", "/about"],
  ["Sustainability", "/sustainability"],
  ["Contact", "/contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <header className="site-header">
      <div className="container flex h-[76px] items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#183d2b] text-lg font-bold text-[#f5ebd7]">
            B
          </span>
          <span>
            <strong className="block font-serif text-xl tracking-wide text-[#183d2b]">
              Bananafibre
            </strong>
            <small className="text-[10px] tracking-[.18em] text-[#78916b]">
              NATURALLY THOUGHTFUL
            </small>
          </span>
        </Link>
        <nav className="desktop-nav flex items-center gap-7">
          {links.map(([label, href]) => (
            <Link className="nav-link" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-[#183d2b]">
          <Link href="/shop" aria-label="Search products">
            <Search size={19} />
          </Link>
          <Link href="/login" aria-label="Account">
            <UserRound size={19} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist">
            <Heart size={19} />
          </Link>
          <Link href="/cart" aria-label={`Cart with ${totalItems} items`} className="relative">
            <ShoppingBag size={19} />
            {totalItems > 0 && <span className="absolute -right-3 -top-3 min-w-5 rounded-full bg-[#43553b] px-1 text-center text-[10px] text-white">{totalItems}</span>}
          </Link>
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container flex flex-col gap-4 pb-5 md:hidden">
          {links.map(([label, href]) => (
            <Link onClick={() => setOpen(false)} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
