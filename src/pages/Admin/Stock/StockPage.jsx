import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  fetchStockSummary,
  fetchDailyStock,
  fetchMonthlyStock,
} from "../../../api/stocks";
import { fetchItems } from "../../../api/items";

export default function StockPage() {
  // Reference for eslint when using <motion.*>
  const __MOTION_REF__ = motion;
  const { auth } = useAuth();
  const token = auth?.token;
  const [tab, setTab] = useState("summary");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  // Item search + suggestions
  const [itemQuery, setItemQuery] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestRef = useRef(null);

  // Summary params
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // Daily
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  // Monthly
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === "summary") {
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;
        const res = await fetchStockSummary(token, params);
        setRows(res.data || []);
      } else if (tab === "daily") {
        const res = await fetchDailyStock(token, date);
        setRows(res.data || []);
      } else if (tab === "monthly") {
        const res = await fetchMonthlyStock(token, year, month);
        setRows(res.data || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load stock");
    } finally {
      setLoading(false);
    }
  }, [tab, from, to, date, year, month, token]);

  useEffect(() => {
    load();
  }, [load]);

  // Load items list once for suggestions
  useEffect(() => {
    const loadItems = async () => {
      if (!token) return;
      try {
        const res = await fetchItems(token, { limit: 1000 });
        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || [];
        setAllItems(list);
      } catch (e) {
        // Non-blocking
        setAllItems([]);
      }
    };
    loadItems();
  }, [token]);

  // Filter table rows by typed item query
  const filteredRows = useMemo(() => {
    const q = itemQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      String(r.item || "")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, itemQuery]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.purchased += Number(r.purchasedQty || 0);
        acc.sold += Number(r.soldQty || 0);
        acc.remaining += Number(r.remaining || 0);
        return acc;
      },
      { purchased: 0, sold: 0, remaining: 0 }
    );
  }, [filteredRows]);

  // Suggestions derived from allItems by name
  const suggestions = useMemo(() => {
    const q = itemQuery.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set();
    const list = [];
    for (const it of allItems) {
      const name = String(it?.name || "");
      if (!name) continue;
      const lower = name.toLowerCase();
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower);
        list.push(name);
      }
      if (list.length >= 8) break;
    }
    return list;
  }, [allItems, itemQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md">
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
                  d="M3 7.5h18M3 12h18M3 16.5h18"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Stock Overview
              </h1>
              <p className="text-gray-500 text-sm">
                Summary, daily and monthly movements
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-xl shadow border ${
                tab === "summary"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
              onClick={() => setTab("summary")}
            >
              Summary
            </button>
            <button
              className={`px-3 py-1 rounded-xl shadow border ${
                tab === "daily"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
              onClick={() => setTab("daily")}
            >
              Daily
            </button>
            <button
              className={`px-3 py-1 rounded-xl shadow border ${
                tab === "monthly"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
              onClick={() => setTab("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Controls */}
        {tab === "summary" && (
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-yellow-200 rounded-xl p-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-yellow-200 rounded-xl p-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              onClick={load}
              className="bg-yellow-600 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-700"
            >
              Apply
            </button>
          </div>
        )}
        {tab === "daily" && (
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-yellow-200 rounded-xl p-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              onClick={load}
              className="bg-yellow-600 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-700"
            >
              Apply
            </button>
          </div>
        )}
        {tab === "monthly" && (
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border border-yellow-200 rounded-xl p-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-28"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border border-yellow-200 rounded-xl p-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-24"
                min={1}
                max={12}
              />
            </div>
            <button
              onClick={load}
              className="bg-yellow-600 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-700"
            >
              Apply
            </button>
          </div>
        )}

        {/* Item search with suggestions */}
        <div className="mb-4 relative" ref={suggestRef}>
          <label className="block text-xs text-gray-500 mb-1">Item</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={itemQuery}
              onChange={(e) => {
                setItemQuery(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              placeholder="Type to search items..."
              className="flex-1 border border-yellow-200 rounded-xl p-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {itemQuery && (
              <button
                type="button"
                onClick={() => setItemQuery("")}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              >
                Clear
              </button>
            )}
          </div>
          {showSuggest && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-yellow-200 rounded-xl shadow max-h-64 overflow-auto">
              {suggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setItemQuery(name);
                    setShowSuggest(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-yellow-50"
                  title={name}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
              <thead className="bg-yellow-50 text-yellow-800">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-right p-3">Purchased Qty</th>
                  <th className="text-right p-3">Sold Qty</th>
                  <th className="text-right p-3">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr
                    key={r.item}
                    className="border-t border-yellow-100 hover:bg-yellow-50/40"
                  >
                    <td className="p-3">{r.item}</td>
                    <td className="p-3 text-right">{r.purchasedQty || 0}</td>
                    <td className="p-3 text-right">{r.soldQty || 0}</td>
                    <td className="p-3 text-right">{r.remaining || 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-yellow-50 font-semibold text-yellow-900">
                  <td className="p-3">Totals</td>
                  <td className="p-3 text-right">{totals.purchased}</td>
                  <td className="p-3 text-right">{totals.sold}</td>
                  <td className="p-3 text-right">{totals.remaining}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
