
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee, ShoppingBag, Users, Package,
  ArrowUpRight, Clock, Truck, CheckCircle
} from "lucide-react";

const initialStats = [
  { title: "Total Revenue", value: "₹0", icon: IndianRupee, color: "olive" },
  { title: "Total Orders", value: "0", icon: ShoppingBag, color: "clay" },
  { title: "Customers", value: "0", icon: Users, color: "sand" },
  { title: "Products", value: "0", icon: Package, color: "olive" }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(initialStats);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin", {
          cache: "no-store"
        });

        if (!response.ok) throw new Error("Dashboard request failed");

        const data = await response.json();

        setStats([
          { title: "Total Revenue", value: `₹${Number(data.revenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "olive" },
          { title: "Total Orders", value: data.totalOrders ?? 0, icon: ShoppingBag, color: "clay" },
          { title: "Customers", value: data.totalCustomers ?? 0, icon: Users, color: "sand" },
          { title: "Products", value: data.totalProducts ?? 0, icon: Package, color: "olive" }
        ]);

        setOrders(data.recentOrders || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const statusIcon = (status) => {
    const value = String(status).toLowerCase();

    if (value.includes("deliver")) return <CheckCircle size={15} />;
    if (value.includes("ship")) return <Truck size={15} />;
    return <Clock size={15} />;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div>
          <span className="admin-eyebrow">YOUR STORE AT A GLANCE</span>
          <h1>welcome back!</h1>
          <p>Here's what's happening at BANANAFIBRE today.</p>
        </div>
        <Link href="/admin/reports" className="outline-admin-btn">
          View reports <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="admin-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div className="admin-stat-card" key={item.title}>
              <div className={`stat-icon ${item.color}`}>
                <Icon size={21} />
              </div>
              <span>{item.title}</span>
              <strong>{loading ? "..." : item.value}</strong>
              <small>Store overview</small>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="admin-panel recent-orders">
          <div className="panel-heading">
            <div>
              <span className="admin-eyebrow">LATEST ACTIVITY</span>
              <h2>Recent orders</h2>
            </div>
            <Link href="/admin/orders">View all →</Link>
          </div>

          {loading ? (
            <p className="admin-empty">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="admin-empty">
              No orders found. New customer orders will appear here.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                      <td>
                        <span className="order-status">
                          {statusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-panel quick-actions">
          <span className="admin-eyebrow">QUICK ACCESS</span>
          <h2>Manage your store</h2>

          <Link href="/admin/products" className="quick-action">
            <Package size={19} /> Add / Manage Products <ArrowUpRight size={16} />
          </Link>
          <Link href="/admin/orders" className="quick-action">
            <ShoppingBag size={19} /> Manage Orders <ArrowUpRight size={16} />
          </Link>
          <Link href="/admin/coupons" className="quick-action">
            <IndianRupee size={19} /> Create Offers <ArrowUpRight size={16} />
          </Link>
          <Link href="/admin/customers" className="quick-action">
            <Users size={19} /> Customer Rewards <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
