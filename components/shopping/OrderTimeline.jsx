

"use client";

import { CheckCircle, Circle, Package, Truck, Home } from "lucide-react";

const steps = [
  { id: "confirmed", title: "Order Confirmed", icon: CheckCircle },
  { id: "packed", title: "Packed", icon: Package },
  { id: "shipped", title: "Shipped", icon: Truck },
  { id: "out-for-delivery", title: "Out for Delivery", icon: Truck },
  { id: "delivered", title: "Delivered", icon: Home }
];

export default function OrderTimeline({ status }) {
  const current = steps.findIndex(s => s.id === status);

  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        This order has been cancelled. Please contact BANAFIBRE support if you need help.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const completed = current >= index;

        return (
          <div key={step.id} className="flex gap-4 min-h-[85px]">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                completed
                  ? "bg-[#43553b] text-white"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {completed ? <Icon size={19} /> : <Circle size={19} />}
              </div>

              {index !== steps.length - 1 && (
                <div className={`w-[2px] flex-1 min-h-10 ${
                  completed ? "bg-[#43553b]" : "bg-gray-200"
                }`} />
              )}
            </div>

            <div className="pt-2">
              <h3 className={`font-semibold ${
                completed ? "text-[#43553b]" : "text-gray-400"
              }`}>
                {step.title}
              </h3>
              {completed && (
                <p className="text-xs text-gray-500 mt-1">
                  Status updated
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
