import React from "react";
import { SlidersHorizontal, CheckCircle2, ShoppingBag, Gamepad2, Power, AlertTriangle, ShieldCheck } from "lucide-react";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";

export default function OrderingOperationsTab() {
  const { portalData, updateOperations } = usePortalHandlerStore();
  const operations = portalData?.operations || {
    acceptOrders: true,
    isActive: true,
    enableCart: true,
    enableFloatingCart: true,
    enableGames: true,
  };

  const handleToggle = (key) => {
    updateOperations({ [key]: !operations[key] });
  };

  return (
    <div className="bg-surface rounded-xl border border-theme p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Ordering & Table Operations
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Control live dine-in ordering, guest checkout capabilities, and portal operational status.
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            operations.acceptOrders && operations.isActive
              ? "bg-green-100 border-green-300 text-green-700"
              : "bg-amber-100 border-amber-300 text-amber-800"
          }`}
        >
          {operations.acceptOrders && operations.isActive
            ? "Ordering Live"
            : "Ordering Paused"}
        </span>
      </div>

      {/* Main Operational Controls */}
      <div className="space-y-3">
        {/* 1. Accept Dine-In Orders */}
        <div className="p-4 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              operations.acceptOrders ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
            }`}>
              <ShoppingBag size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">
                Accept Dine-In Orders
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                When enabled, seated customers can place orders and add items to cart. When disabled, customers can only browse the menu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("acceptOrders")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              operations.acceptOrders
                ? "bg-green-600 border-green-700 text-white hover:bg-green-700"
                : "bg-surface border-theme text-secondary hover:bg-gray-200"
            }`}
          >
            {operations.acceptOrders ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* 2. Portal Active Status */}
        <div className="p-4 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              operations.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"
            }`}>
              <Power size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">
                Portal Service Status
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Main restaurant portal availability. Set to inactive during off-hours or restaurant holidays.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("isActive")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              operations.isActive
                ? "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700"
                : "bg-surface border-theme text-secondary hover:bg-gray-200"
            }`}
          >
            {operations.isActive ? "Active" : "Offline"}
          </button>
        </div>

        {/* 3. Floating Bottom Cart Bar */}
        <div className="p-4 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              operations.enableFloatingCart ? "bg-orange-100 text-[#d9480f]" : "bg-gray-200 text-gray-500"
            }`}>
              <ShoppingBag size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">
                Floating Cart Bar
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Display sticky bottom bar showing cart item count and quick checkout button.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("enableFloatingCart")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              operations.enableFloatingCart
                ? "bg-green-600 border-green-700 text-white hover:bg-green-700"
                : "bg-surface border-theme text-secondary hover:bg-gray-200"
            }`}
          >
            {operations.enableFloatingCart ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* 4. Table Gaming Shortcut */}
        <div className="p-4 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              operations.enableGames ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-500"
            }`}>
              <Gamepad2 size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme">
                Table Gaming & Fun ("Play Games" Button)
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Display games shortcut on portal home for guest entertainment while waiting for food.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("enableGames")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              operations.enableGames
                ? "bg-green-600 border-green-700 text-white hover:bg-green-700"
                : "bg-surface border-theme text-secondary hover:bg-gray-200"
            }`}
          >
            {operations.enableGames ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
}

