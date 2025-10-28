import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const categories = [
    { value: "all", label: "All" },
    { value: "mobile", label: "Mobile" },
    { value: "smartphone", label: "Smartphone" },
    { value: "accessories", label: "Accessories" },
    { value: "display", label: "Display" },
  ];

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

  // Reset brand selection when category changes
  useEffect(() => {
    setSelectedBrand("all");
  }, [category]);

  // Extract first word from item name as brand
  const extractBrand = useCallback((name) => {
    if (!name || typeof name !== "string") return "Unknown";
    const first = name.trim().split(/\s+/)[0];
    if (!first) return "Unknown";
    // Normalize casing: capitalize first letter, rest lower
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }, []);

  // Build brand options for current list (works after API filter by category)
  const brandOptions = useMemo(() => {
    if (!(category === "mobile" || category === "smartphone")) return [];
    const set = new Set();
    (items || []).forEach((it) => {
      const b = extractBrand(it?.name);
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [items, category, extractBrand]);

  // Client-side search filter (mobile search)
  const displayItems = useMemo(() => {
    let list = items;
    // Apply brand filter for mobile/smartphone
    if (
      (category === "mobile" || category === "smartphone") &&
      selectedBrand &&
      selectedBrand !== "all"
    ) {
      list = list.filter((it) => extractBrand(it?.name) === selectedBrand);
    }

    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(
      (it) =>
        String(it.name || "")
          .toLowerCase()
          .includes(q) ||
        String(it.description || "")
          .toLowerCase()
          .includes(q)
    );
  }, [items, category, selectedBrand, query, extractBrand]);

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

          {/* Desktop category select */}
          <div className="hidden sm:flex items-center gap-2">
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

        {/* Mobile: category pills + search + brand tabs */}
        <div className="sm:hidden mb-3">
          {/* Mobile: category pills + search bar (two-row layout) */}
          <div className="sm:hidden mb-4 space-y-2">
            {/* Row 1: Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    category === c.value
                      ? "bg-yellow-600 text-white border-yellow-600"
                      : "bg-white text-gray-700 border-yellow-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Row 2: Search bar */}
            <div className="flex items-center gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items..."
                className="flex-1 border border-yellow-200 rounded-xl px-4 py-2 bg-white/90 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-2 bg-yellow-500 text-white rounded-xl"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Row 3: Brand tabs (only for Mobile/Smartphone) */}
            {(category === "mobile" || category === "smartphone") && (
              <div className="pt-1">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBrand("all")}
                    className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${
                      selectedBrand === "all"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-gray-700 border-yellow-200"
                    }`}
                  >
                    All brands
                  </button>
                  {brandOptions.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${
                        selectedBrand === b
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-gray-700 border-yellow-200"
                      }`}
                      title={b}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: brand tabs under desktop category select */}
        {(category === "mobile" || category === "smartphone") && (
          <div className="hidden sm:block mb-3">
            <div className="bg-white/80 border border-yellow-200 rounded-xl p-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 mr-1">Brands</span>
              <button
                type="button"
                onClick={() => setSelectedBrand("all")}
                className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${
                  selectedBrand === "all"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-gray-700 border-yellow-200"
                }`}
              >
                All brands
              </button>
              {brandOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${
                    selectedBrand === b
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-gray-700 border-yellow-200"
                  }`}
                  title={b}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-4 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-yellow-100/60 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2">
              {displayItems.map((item) => (
                <div
                  key={item._id}
                  className="border border-yellow-200 rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-gray--400 to-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/shop/items/${item._id}`)}
                    className="block w-full text-left"
                    title="View details"
                  >
                    {/* ✅ FIXED IMAGE RESPONSIVENESS */}
                    <div className="relative w-full max-w-[1500px] mx-auto rounded-xl border overflow-hidden bg-gray-100 flex justify-center items-center">
                      <img
                        src={item.image || "NoImage"}
                        alt={item.name}
                        className="w-full h-auto object-cover object-center aspect-square sm:aspect-[4/3] md:aspect-square"
                        width="1500"
                        height="1280"
                      />
                    </div>
                  </button>

                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/shop/items/${item._id}`)}
                        className="relative group text-left font-semibold transition-all duration-300"
                      >
                        <span
                          className="relative inline-block px-4 py-1.5 rounded-2xl border border-amber-400 bg-gradient-to-r from-yellow-600 to-yellow-500
             text-white font-bold tracking-wide shadow-sm
             transition-all duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:brightness-110"
                        >
                          {item.name}
                        </span>
                      </button>
                    </div>
                    {/* Order button removed as requested */}
                  </div>
                </div>
              ))}

              {!loading && displayItems.length === 0 && (
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
