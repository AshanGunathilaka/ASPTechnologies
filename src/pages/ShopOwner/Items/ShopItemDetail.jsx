import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { shopClient } from "../../../api/shop";
import { shopCreateOrder } from "../../../api/shopOrders";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function ShopItemDetail() {
  const { id } = useParams();
  const { auth } = useShopAuth();
  const __MOTION_REF__ = motion;
  const token = auth?.token;
  const navigate = useNavigate();
  const [item, setItem] = useState();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await shopClient(token).get(`/shop/items/${id}`);
      setItem(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load item");
    }
  }, [token, id]);

  useEffect(() => {
    if (token && id) load();
  }, [load, token, id]);

  const order = async () => {
    await shopCreateOrder(token, { type: "item", item: id, quantity, note });
    toast.success("Order placed");
    navigate("/shop/orders");
  };

  if (!item) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 animate-pulse">
        <div className="max-w-5xl mx-auto h-64 bg-yellow-100/60 rounded-2xl" />
      </div>
    );
  }

  const badgeClass = (status) =>
    status === "available"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const getDescriptionItems = (desc) => {
    if (!desc) return [];
    const normalized = String(desc).replace(/\r/g, "").trim();
    if (!normalized) return [];

    // 1) Prefer explicit line breaks
    let parts = normalized
      .split(/\n+/)
      .map((s) => s.trim().replace(/^[-*•]\s+/, ""))
      .filter(Boolean);
    if (parts.length > 1) return parts;

    // 2) Bulleted prefixes within a single line
    const bulletSplit = normalized
      .split(/(?:^|\s)[-*•]\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (bulletSplit.length > 1) return bulletSplit;

    // 3) Semicolons
    parts = normalized
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 1) return parts;

    // 4) Commas (only if there are multiple commas to avoid over-splitting)
    const commaCount = (normalized.match(/,/g) || []).length;
    if (commaCount >= 2) {
      parts = normalized
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > 1) return parts;
    }

    return [normalized];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        {/* Header (mirror admin detail) */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M7 21l3-3m0 0l3 3m-3-3V3"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Item Details
              </h1>
              <p className="text-gray-500 text-sm">
                Full information for this item
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/shop/items`)}
              className="px-4 py-2 rounded-xl font-semibold bg-yellow-400 hover:bg-gray-300 text-amber-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="relative w-full max-w-[180px] mx-auto rounded-xl border overflow-hidden bg-gray-100 flex justify-center items-center">
                <img
                  src={item.image || "NoImage"}
                  alt={item.name}
                  className="w-full h-auto object-cover object-center aspect-square sm:aspect-[4/3] md:aspect-square"
                  width="1280"
                  height="1280"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500  tracking-wide ">
                  Name
                </span>
                <div className="text-2xl font-semibold text-amber-50 bg-gradient-to-r from-blue-500 to-blue-200 px-3 py-2 rounded-xl border border-blue-200 shadow-sm mt-2">
                  {item.name}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500  tracking-wide">
                  Status
                </span>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs border ${badgeClass(
                      item.status
                    )}`}
                  >
                    {item.status === "available" ? "Available" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {/* Header with blue gradient background */}
                <div className="flex items-center gap-3 bg-yellow-400 p-3 rounded-xl shadow-md">
                  <div className="p-2 bg-white/20 rounded-lg shadow-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block mt-1">
                      Description
                    </span>
                    <span className="text-xs text-black">
                      Product details & features
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 border border-blue-400/30 shadow-lg overflow-hidden"
                >
                  <div className="p-4">
                    {(() => {
                      const items = getDescriptionItems(item.description);

                      if (!items.length)
                        return (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center gap-3 py-8 text-blue-100/70"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium text-sm">
                              No description available
                            </span>
                          </motion.div>
                        );

                      if (items.length === 1)
                        return (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white leading-relaxed text-[15px] font-medium text-center md:text-left"
                          >
                            {items[0]}
                          </motion.p>
                        );

                      return (
                        <ul className="space-y-3">
                          {items.map((it, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-200 touch-manipulation"
                            >
                              {/* Text */}
                              <span className="text-white leading-relaxed text-[20px] font-bold flex-1">
                                {it}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                </motion.div>
              </div>

              {/* Order controls */}
              <div className="pt-2">
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
                  Order Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
