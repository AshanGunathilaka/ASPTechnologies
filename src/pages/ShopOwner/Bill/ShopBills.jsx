import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { fetchShopBills } from "../../../api/shop";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const number = (n) => Number(n || 0).toLocaleString();

const ShopBills = () => {
  const __MOTION_REF__ = motion;
  const { auth } = useShopAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all"); // all | paid | nonpaid

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await fetchShopBills(auth.token, params);
      setRows(data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, [auth?.token, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    if (status === "all") return rows;
    const isPaid = (s) => String(s || "").toLowerCase() === "paid";
    return rows.filter((r) =>
      status === "paid" ? isPaid(r.status) : !isPaid(r.status)
    );
  }, [rows, status]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => ({
        grand: acc.grand + Number(r.grandTotal || 0),
        remaining: acc.remaining + Number(r.remaining || 0),
      }),
      { grand: 0, remaining: 0 }
    );
  }, [filteredRows]);

  const statusCounts = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        const s = String(r.status || "").toLowerCase();
        if (s === "paid") acc.paid += 1;
        else if (s === "partially paid") acc.partial += 1;
        else acc.unpaid += 1;
        return acc;
      },
      { paid: 0, partial: 0, unpaid: 0 }
    );
  }, [filteredRows]);

  const statusBadge = (s) => (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        s === "paid"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s === "partially paid"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {s}
    </span>
  );

  // Removed Remaining Days calculation

  const apply = async () => {
    await load();
    toast.success("Filters applied");
  };

  const quick = (key) => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    let start = end;
    if (key === "month")
      start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
    setFrom(start);
    setTo(end);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
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
                Bills
              </h1>
              <p className="text-gray-500 text-sm">
                All your bills and outstanding
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 bg-white/80 border border-yellow-200 rounded-2xl p-4">
          <div>
            <label className="block text-xs text-gray-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Status</label>
            <div className="flex gap-1 bg-white/70 rounded-xl p-1 border border-yellow-200">
              <button
                onClick={() => setStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  status === "all"
                    ? "bg-yellow-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatus("paid")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  status === "paid"
                    ? "bg-yellow-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setStatus("nonpaid")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  status === "nonpaid"
                    ? "bg-yellow-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Non-paid
              </button>
            </div>
          </div>
          <button
            onClick={apply}
            className="px-4 py-2 bg-yellow-600 text-white rounded-xl shadow hover:bg-yellow-700"
          >
            Apply
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => quick("month")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              This Month
            </button>
            <button
              onClick={() => {
                setFrom("");
                setTo("");
                apply();
              }}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
            <div className="text-xs text-gray-500">Bills</div>
            <div className="mt-1 text-xl font-semibold text-yellow-800">
              {rows.length}
            </div>
          </div>
          <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
            <div className="text-xs text-gray-500">Total</div>
            <div className="mt-1 text-xl font-semibold text-yellow-800">
              Rs. {number(totals.grand)}
            </div>
          </div>
          <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
            <div className="text-xs text-gray-500">Outstanding</div>
            <div className="mt-1 text-xl font-semibold text-rose-700">
              Rs. {number(totals.remaining)}
            </div>
          </div>
          <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
            <div className="text-xs text-gray-500">Cleared</div>
            <div className="mt-1 text-xl font-semibold text-emerald-700">
              Rs. {number(totals.grand - totals.remaining)}
            </div>
          </div>
        </div>

        {/* Quick status snapshot */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 shadow-sm border border-emerald-200 bg-emerald-50/60 text-center">
            <div className="text-xs text-emerald-700">Paid</div>
            <div className="text-lg font-semibold text-emerald-800">
              {statusCounts.paid}
            </div>
          </div>
          <div className="rounded-2xl p-3 shadow-sm border border-amber-200 bg-amber-50/60 text-center">
            <div className="text-xs text-amber-700">Partial</div>
            <div className="text-lg font-semibold text-amber-800">
              {statusCounts.partial}
            </div>
          </div>
          <div className="rounded-2xl p-3 shadow-sm border border-gray-200 bg-gray-50/60 text-center">
            <div className="text-xs text-gray-700">Unpaid</div>
            <div className="text-lg font-semibold text-gray-800">
              {statusCounts.unpaid}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-yellow-100/60 rounded-2xl animate-pulse" />
        ) : filteredRows.length ? (
          <>
            {/* Desktop/tablet table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
                <thead className="bg-yellow-50 text-yellow-800 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Bill #</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-right p-3 pr-8">Remaining</th>
                    <th className="text-left p-3">Status</th>

                    <th className="text-right p-3">Items</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => {
                    return (
                      <tr
                        key={r._id}
                        className="border-t border-yellow-100 hover:bg-yellow-50/40"
                      >
                        <td className="p-3">{String(r.date).slice(0, 10)}</td>
                        <td className="p-3">{r.number}</td>
                        <td className="p-3 text-right">
                          {number(r.grandTotal)}
                        </td>
                        <td className="p-3 pr-15 text-right">
                          {number(r.remaining)}
                        </td>
                        <td className="p-3 pl-3">{statusBadge(r.status)}</td>
                        <td className="p-3 text-right">{r.itemsCount}</td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/shop/bills/${r._id}`}
                            className="px-3 py-1.5 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filteredRows.map((r) => {
                return (
                  <div
                    key={r._id}
                    className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-yellow-800">
                        {r.number}
                      </div>
                      {statusBadge(r.status)}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {String(r.date).slice(0, 10)} • {r.itemsCount} items
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-gray-600">Total</div>
                      <div className="font-semibold">
                        Rs. {number(r.grandTotal)}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-gray-600">Remaining</div>
                      <div className="font-semibold text-amber-700">
                        Rs. {number(r.remaining)}
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <Link
                        to={`/shop/bills/${r._id}`}
                        className="px-3 py-1.5 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
            <div className="text-lg font-semibold mb-1">No bills</div>
            <div className="text-sm">Adjust filters and try again.</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShopBills;
