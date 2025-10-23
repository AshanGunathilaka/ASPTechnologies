import React, { useEffect, useState } from "react";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { fetchShopDashboard } from "../../../api/shop";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const Card = ({ title, value, sub }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl border border-yellow-100 shadow-sm p-5 hover:shadow-md transition">
    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {title}
    </div>
    <div className="mt-1 text-3xl font-bold text-gray-800">{value}</div>
    {sub ? <div className="text-xs text-gray-500 mt-2">{sub}</div> : null}
  </div>
);

const List = ({ title, items, render }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl border border-yellow-100 shadow-sm p-5">
    <div className="font-semibold mb-3 text-gray-800">{title}</div>
    <ul className="text-sm">
      {items?.length ? (
        items.map((it, idx) => (
          <li
            key={idx}
            className="py-2 first:pt-0 last:pb-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition"
          >
            {render(it)}
          </li>
        ))
      ) : (
        <li className="text-gray-400 py-2">No data</li>
      )}
    </ul>
  </div>
);

const ShopDashboard = () => {
  const { auth } = useShopAuth();
  const __MOTION_REF__ = motion;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;
        const res = await fetchShopDashboard(auth.token, params);
        if (mounted) setData(res.data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [auth.token, from, to]);

  if (error) toast.error(error);
  if (loading)
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
          <div className="h-10 bg-yellow-100/60 rounded-2xl" />
          <div className="h-40 bg-yellow-100/60 rounded-2xl" />
        </div>
      </div>
    );

  const k = data?.kpis || {};
  const ordersByStatus = data?.ordersByStatus || {};
  const repairsByStatus = data?.repairsByStatus || {};
  const recent = data?.recent || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
            Dashboard
          </h1>
          <div className="w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2 bg-white/80 border border-yellow-100 rounded-xl p-2 shadow-sm">
              <label className="text-gray-600 text-sm">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-yellow-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 w-full sm:w-auto"
              />
              <label className="text-gray-600 text-sm">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-yellow-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            title="Purchases (Total)"
            value={`Rs. ${(k?.purchases?.total || 0).toLocaleString()}`}
            sub={`${k?.purchases?.count || 0} bills`}
          />
          <Card
            title="Payments (Total)"
            value={`Rs. ${(k?.purchases?.paid || 0).toLocaleString()}`}
          />
          <Card
            title="Outstanding"
            value={`Rs. ${(k?.purchases?.outstanding || 0).toLocaleString()}`}
          />
          <Card
            title="Warnings"
            value={k?.warnings?.count || 0}
            sub="Active warnings"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-yellow-100 shadow-sm p-5">
            <div className="font-semibold mb-2 text-gray-800">
              Orders status
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.keys(ordersByStatus).map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 capitalize">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    {s}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {ordersByStatus[s]}
                  </span>
                </div>
              ))}
              {!Object.keys(ordersByStatus).length && (
                <div className="text-gray-400">No orders</div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl border border-yellow-100 shadow-sm p-5">
            <div className="font-semibold mb-2 text-gray-800">
              Repairs status
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.keys(repairsByStatus).map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 capitalize">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    {s}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {repairsByStatus[s]}
                  </span>
                </div>
              ))}
              {!Object.keys(repairsByStatus).length && (
                <div className="text-gray-400">No repairs</div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl border border-yellow-100 shadow-sm p-5">
            <div className="font-semibold mb-2 text-gray-800">Today</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Purchases</span>
                <span className="font-semibold">
                  {k?.today?.purchases?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Paid</span>
                <span className="font-semibold">
                  Rs. {(k?.today?.purchases?.paid || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <List
            title="Recent finance"
            items={recent?.finance}
            render={(it) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.type}</div>
                  <div className="text-gray-500 text-xs">{it.detail}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {it.amount != null
                      ? `Rs. ${it.amount.toLocaleString()}`
                      : "-"}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(it.date).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          />

          <List
            title="Recent orders"
            items={recent?.orders}
            render={(o) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium capitalize">{o.type}</div>
                  <div className="text-gray-500 text-xs">{o.ref}</div>
                </div>
                <div className="text-right text-sm">
                  <div>Qty: {o.quantity}</div>
                  <div className="capitalize">{o.status}</div>
                </div>
              </div>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <List
            title="Recent repairs"
            items={recent?.repairs}
            render={(r) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.jobSheetNumber}</div>
                  <div className="text-gray-500 text-xs">{r.phoneModel}</div>
                </div>
                <div className="text-right text-sm capitalize">{r.status}</div>
              </div>
            )}
          />
          <List
            title="Recent warnings"
            items={recent?.warnings}
            render={(w) => (
              <div className="flex items-center justify-between">
                <div className="font-medium">{w.title || "Warning"}</div>
                <div className="text-gray-400 text-xs">
                  {new Date(w.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ShopDashboard;
