
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  TicketPercent, ChartNoAxesCombined, Settings,
  Menu, X, Leaf, LogOut, Bell, Store
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { name: "Reports", href: "/admin/reports", icon: ChartNoAxesCombined },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="admin-layout">
      {open && (
        <button
          className="admin-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`admin-sidebar ${open ? "sidebar-open" : ""}`}>
        <Link href="/admin" className="admin-brand">
          <span className="brand-icon"><Leaf size={23} /></span>
          <span>
            <strong>BANANAFIBRE</strong>
            <small>ADMIN STUDIO</small>
          </span>
          <button
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </Link>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="admin-nav">
          {navigation.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`admin-nav-link ${active ? "active" : ""}`}
              >
                <Icon size={19} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="profile-avatar">B</div>
            <div>
              <strong>Store Admin</strong>
              <small>Administrator</small>
            </div>
          </div>

          <button className="admin-logout" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="mobile-menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>

          <div className="topbar-title">
            <span>Store management</span>
            <small> / BANANAFIBRE Admin</small>
          </div>

          <div className="topbar-actions">
            <Link href="/admin/settings" className="admin-icon-btn"
              aria-label="Admin settings">
              <Bell size={19} />
            </Link>
            <Link href="/" className="store-link">
              <Store size={17} /> Visit Store
            </Link>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
