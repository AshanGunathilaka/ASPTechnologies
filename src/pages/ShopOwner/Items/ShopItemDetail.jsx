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
              className="px-4 py-2 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="relative w-full max-w-[1280px] mx-auto rounded-xl border overflow-hidden bg-gray-100 flex justify-center items-center">
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
              <div>
                <span className="text-gray-500 text-xs">Name</span>
                <div className="text-xl font-semibold">{item.name}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Status</span>
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
              <div>
                <span className="text-gray-500 text-xs">Description</span>
                <div className="p-3 rounded-lg border bg-gray-50 min-h-[44px] text-gray-700">
                  {item.description || "-"}
                </div>
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
