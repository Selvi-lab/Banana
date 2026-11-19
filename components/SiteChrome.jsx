"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const standalone =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin");

  if (standalone) return children;

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
