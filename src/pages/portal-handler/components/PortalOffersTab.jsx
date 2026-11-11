import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, ExternalLink, ArrowRight, CheckCircle2, XCircle, Info } from "lucide-react";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";
import { useOffersStore } from "../../../store/offersStore";
import Button from "../../../components/ui/Button";

export default function PortalOffersTab() {
  const navigate = useNavigate();
  const { portalData, toggleOffersSection, updateOffersContent } = usePortalHandlerStore();
  const { offers: storeOffers, fetchOffers, loading } = useOffersStore();

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const { offers: portalOffers } = portalData;

  // Fallback demo offers if store is empty
  const activeOffers =
    storeOffers && storeOffers.length > 0
      ? storeOffers
      : [
          {
            id: "off-1",
            code: "TABLLY20",
            name: "Flat 20% OFF on Dine-In",
            discountType: "percentage",
            discountValue: 20,
            minimumOrderAmount: 799,
            status: "active",
          },
          {
            id: "off-2",
            code: "SWEETTREAT",
            name: "Complimentary Hot Sizzler Brownie",
            discountType: "flat",
            discountValue: 195,
            minimumOrderAmount: 1199,
            status: "active",
          },
          {
            id: "off-3",
            code: "HAPPYHOURS",
            name: "Buy 1 Get 1 on All Mocktails",
            discountType: "percentage",
            discountValue: 50,
            minimumOrderAmount: 0,
            status: "active",
          },
        ];

  return (
    <div className="bg-surface rounded-xl border border-theme p-5 space-y-6">
      {/* Header & Section Enable/Disable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Tag size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Offers & Promos on Portal
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Control the offers section visibility and promotional headline on the customer ordering portal.
            </p>
          </div>
        </div>

        {/* Section Enable/Disable Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toggleOffersSection()}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              portalOffers.enabled
                ? "bg-green-600 border-green-700 text-white hover:bg-green-700"
                : "bg-surface-soft border-theme text-theme hover:bg-gray-200"
            }`}
          >
            {portalOffers.enabled ? "Section Enabled" : "Section Disabled"}
          </button>
        </div>
      </div>

      {/* Update Only Content Form */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-theme">
          Portal Display Content
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={portalOffers.title || ""}
              onChange={(e) => updateOffersContent({ title: e.target.value })}
              placeholder="e.g. Special Table Offers & Promos"
              className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme mb-1">
              Section Subtitle
            </label>
            <input
              type="text"
              value={portalOffers.subtitle || ""}
              onChange={(e) => updateOffersContent({ subtitle: e.target.value })}
              placeholder="e.g. Applicable directly to your dine-in table order at checkout"
              className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-theme mb-1">
            Announcement Note / Instructions for Diners
          </label>
          <input
            type="text"
            value={portalOffers.bannerAnnouncement || ""}
            onChange={(e) =>
              updateOffersContent({ bannerAnnouncement: e.target.value })
            }
            placeholder="e.g. Show active coupon code to your server or apply directly in table session"
            className="w-full px-3 py-2 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Synced Offers List from Offers & Promos Module */}
      <div className="space-y-3 pt-4 border-t border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-theme">
              Live Offers Synced from Offers & Promos ({activeOffers.length})
            </h4>
            <p className="text-[11px] text-secondary">
              Offer data, discounts, and coupon codes are managed in the Offers & Promos module.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate("/offers-promos")}
          >
            Manage in Offers & Promos
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeOffers.map((offer) => {
            const isOfferActive = offer.status === "active";
            const discountLabel =
              offer.discountType === "percentage"
                ? `${offer.discountValue}% OFF`
                : `₹${offer.discountValue} OFF`;

            return (
              <div
                key={offer.id || offer._id || offer.code}
                className="p-3.5 rounded-xl border border-theme bg-surface-soft space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-surface border border-theme px-2 py-0.5 rounded text-primary">
                    {offer.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOfferActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isOfferActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-theme line-clamp-1">
                    {offer.name || offer.title}
                  </h5>
                  <p className="text-[11px] text-secondary mt-0.5">
                    {discountLabel} • Min Order: ₹{offer.minimumOrderAmount || 0}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
