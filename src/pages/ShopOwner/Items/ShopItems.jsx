import React, { useEffect, useState, useCallback } from "react";
import { fetchShopItems } from "../../../api/shop";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const ShopItems = () => {
  const __MOTION_REF__ = motion; // satisfy some eslint configs
  const { auth } = useShopAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  const load = useCallback(async () => {
    if (!auth?.token) return;
    try {
      setLoading(true);
      const params = {};
      if (category && category !== "all") params.category = category;
      const res = await fetchShopItems(auth.token, params);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [auth?.token, category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
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
                className="w-6 h-6 sm:w-7 sm:h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M7 21l3-3m0 0l3 3m-3-3V3"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Items
              </h1>
              <p className="text-gray-500 text-sm">Browse and order items</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/80 border border-yellow-200 rounded-xl p-2 flex flex-wrap items-center">
              <label className="text-sm text-gray-600 mr-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 text-sm"
              >
                <option value="all">All</option>
                <option value="mobile">Mobile</option>
                <option value="smartphone">Smart Phone</option>
                <option value="accessories">Accessories</option>
                <option value="display">Display</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-4 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-yellow-100/60 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-lg transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/shop/items/${item._id}`)}
                    className="block w-full text-left"
                    title="View details"
                  >
                    {/* ✅ FIXED IMAGE RESPONSIVENESS */}
                    <div className="relative w-full max-w-[1280px] mx-auto rounded-xl border overflow-hidden bg-gray-100 flex justify-center items-center">
                      <img
                        src={item.image || "NoImage"}
                        alt={item.name}
                        className="w-full h-auto object-cover object-center aspect-square sm:aspect-[4/3] md:aspect-square"
                        width="1280"
                        height="1280"
                      />
                    </div>
                  </button>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/shop/items/${item._id}`)}
                        className="relative font-semibold text-amber-700 hover:text-amber-800 transition-all duration-300 group text-left"
                      >
                        <span className="relative">
                          {item.name}
                          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </span>
                      </button>

                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${
                          item.status === "available"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {item.status === "available"
                          ? "Available"
                          : "Out of Stock"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mt-1 line-clamp-3 whitespace-pre-line">
                      {item.description}
                    </p>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => navigate(`/shop/items/${item._id}`)}
                        className="relative overflow-hidden w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none active:scale-95"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-60 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-[1.2s] rounded-lg"></span>
                        <span className="relative z-10 flex items-center justify-center gap-1">
                          🛒 <span>Order</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && items.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                  No items found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopItems;
