import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { fetchShopOffer } from "../../../api/shop";
import { shopCreateOrder } from "../../../api/shopOrders";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function ShopOfferDetail() {
  const { id } = useParams();
  const { auth } = useShopAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const [offer, setOffer] = useState();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const __MOTION_REF__ = motion;

  const load = useCallback(async () => {
    try {
      const res = await fetchShopOffer(token, id);
      setOffer(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load offer");
    }
  }, [token, id]);

  useEffect(() => {
    if (token && id) load();
  }, [token, id, load]);

  const order = async () => {
    try {
      await shopCreateOrder(token, {
        type: "offer",
        offer: id,
        quantity,
        note,
      });
      toast.success("Order placed");
      navigate("/shop/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order");
    }
  };

  if (!offer) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 animate-pulse">
        <div className="max-w-5xl mx-auto h-64 bg-yellow-100/60 rounded-2xl" />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        {/* Header (mirror admin detail) */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-800">Offer details</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/shop/offers`)}
              className="px-4 py-2 rounded-xl bg-yellow-400 text-white border border-gray-200 hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {/* Summary card */}
          <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-yellow-800 truncate">
                {offer.title}
              </h2>
              {offer.status && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    offer.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200 uppercase"
                      : "bg-gray-50 text-gray-700 border-gray-200 uppercase"
                  }`}
                >
                  {offer.status}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {offer.startDate ? String(offer.startDate).slice(0, 10) : "-"} →{" "}
              {offer.endDate ? String(offer.endDate).slice(0, 10) : "-"}
            </div>
            {offer.description && (
              <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                {offer.description}
              </p>
            )}
          </div>

          {/* Images grid */}
          <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
            <h3 className="font-semibold text-yellow-800 mb-2">Images</h3>
            {offer.images?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {offer.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`offer-${i}`}
                    className="h-32 w-full object-cover rounded border"
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No images</div>
            )}
          </div>

          {/* Items grid */}
          <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
            <h3 className="font-semibold text-yellow-800 mb-2">Items</h3>
            {offer.items?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {offer.items.map((item) => (
                  <div
                    key={item._id || item}
                    className="flex flex-col items-center p-2 rounded-xl border border-yellow-100 bg-white/60"
                  >
                    {/* Item Image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded mb-2" />
                    )}

                    {/* Item Name */}
                    <div className="text-center font-medium text-sm truncate">
                      {item.name || item}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No items available.</p>
            )}
          </div>

          {/* Order panel */}
          <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
            <h3 className="font-semibold text-yellow-800 mb-2">Order</h3>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-600">Qty</label>
              <input
                type="number"
                min={1}
                className="border border-yellow-200 rounded-xl px-3 py-2 w-24"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value || 1)))
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600">
                Note (optional)
              </label>
              <textarea
                className="border border-yellow-200 rounded-xl w-full p-2"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              onClick={order}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-xl shadow hover:from-amber-600 hover:to-yellow-700 transition"
            >
              Order Offer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
