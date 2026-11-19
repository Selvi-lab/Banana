
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <p className="eyebrow">Almost yours</p>

        <h1 className="section-title">
          Order Confirmation
        </h1>

        <div className="card mt-7 space-y-5 p-6">

          <div className="text-center py-5">
            <CheckCircle
              size={65}
              className="mx-auto text-[#526c43] mb-5"
            />

            <span className="text-xs tracking-[3px] text-[#8b8a72]">
              BANANAFIBRE ORDER CONFIRMATION
            </span>

            <h2 className="font-serif text-3xl text-[#183d2b] mt-4">
              Thank you for your order!
            </h2>

            <p className="text-gray-500 mt-4">
              Your order has been received. We'll keep you updated
              as your package moves towards you.
            </p>
          </div>

          <div className="bg-[#f5f1e8] rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500">
              YOUR ORDER ID
            </p>

            <h2 className="text-2xl font-semibold mt-2 text-[#183d2b]">
              #{orderId || "Unavailable"}
            </h2>

            <p className="text-sm mt-3 text-[#526c43]">
              Cash on Delivery
            </p>
          </div>

          <h2 className="pt-3 font-serif text-xl text-[#183d2b]">
            Order Details
          </h2>

          <Link
            href={orderId ? `/orders/${orderId}` : "/orders"}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Package size={19} />
            Track Your Order
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/orders"
            className="block text-center text-[#526c43] text-sm"
          >
            View My Orders
          </Link>

          <Link
            href="/shop"
            className="block text-center text-gray-500 text-sm"
          >
            Continue Shopping
          </Link>

        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<p className="p-10">Loading...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
