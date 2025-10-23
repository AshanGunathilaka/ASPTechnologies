import React, { useCallback, useEffect, useState } from "react";
import { fetchShopOffers } from "../../../api/shop";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const ShopOffers = () => {
  const { auth } = useShopAuth();
  const __MOTION_REF__ = motion; // satisfy some eslint configs
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!auth?.token) return;
    try {
      setLoading(true);
      const res = await fetchShopOffers(auth.token);
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header (match admin style) */}
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
                Offers
              </h1>
              <p className="text-gray-500 text-sm">View and order offers</p>
            </div>
          </div>
        </div>

        {/* Offers grid (match admin card style) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-yellow-100/60 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((o) => (
                <div
                  key={o._id}
                  className="rounded-2xl shadow-sm border border-yellow-200 bg-white/80 overflow-hidden flex flex-col"
                >
                  {Array.isArray(o.images) && o.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 p-2 bg-yellow-50/50 border-b border-yellow-100">
                      {o.images.slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`offer-img-${i}`}
                          className="h-24 w-full object-cover rounded"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-24 bg-yellow-50 border-b border-yellow-100" />
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/shop/offers/${o._id}`)}
                        className="font-semibold text-yellow-800 hover:underline text-left"
                      >
                        {o.title}
                      </button>
                      <span className="px-2 py-0.5 rounded-full text-xs border bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                        {o.items?.length || 0} items
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {o.startDate ? String(o.startDate).slice(0, 10) : "-"} →{" "}
                      {o.endDate ? String(o.endDate).slice(0, 10) : "-"}
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {o.description || ""}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/shop/offers/${o._id}`)}
                        className="px-3 py-1.5 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/shop/offers/${o._id}`)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow text-sm"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && offers.length === 0 && (
                <div className="text-sm text-gray-500">No offers</div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopOffers;
