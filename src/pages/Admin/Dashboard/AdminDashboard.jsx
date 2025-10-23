import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchDashboardOverview } from "../../../api/dashboard";
import { fetchItems } from "../../../api/items";
import { fetchCashflowReport } from "../../../api/reports";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const number = (n) => (n || 0).toLocaleString();

const Stat = ({ label, value, accent = "" }) => (
  <div className="rounded-2xl p-4 shadow-sm border border-yellow-200 bg-white/80">
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`mt-1 text-xl font-semibold ${accent}`}>{value}</div>
  </div>
);

const Section = ({ title, children, right }) => (
  <div className="rounded-2xl shadow-sm border border-yellow-200 bg-white/80">
    <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-100">
      <h2 className="text-lg font-semibold text-yellow-800">{title}</h2>
      {right}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const MiniBarChart = ({ data, height = 160 }) => {
  // Improved chart: split into positive (inflow) above axis and negative (outflow) below
  // expects [{date, inflow, outflow, net}]
  const maxIO = useMemo(
    () =>
      Math.max(
        1,
        ...data.map((d) =>
          Math.max(Number(d.inflow || 0), Number(d.outflow || 0))
        )
      ),
    [data]
  );
  const half = height / 2;
  return (
    <div className="flex items-stretch gap-1" style={{ height }}>
      {data.map((d) => {
        const inflowPct = Math.min(100, (Number(d.inflow || 0) / maxIO) * 100);
        const outflowPct = Math.min(
          100,
          (Number(d.outflow || 0) / maxIO) * 100
        );
        return (
          <div key={d.date} className="flex flex-col items-center w-5">
            {/* Positive (inflow) - top half */}
            <div className="flex flex-col justify-end h-1/2 w-full">
              <div
                className="w-full bg-emerald-500 rounded-t"
                style={{ height: `${(inflowPct / 100) * half}px` }}
                title={`Inflow: ${Number(d.inflow || 0).toFixed(2)}`}
              />
            </div>
            {/* Negative (outflow) - bottom half */}
            <div className="flex flex-col justify-start h-1/2 w-full">
              <div
                className="w-full bg-rose-500 rounded-b"
                style={{ height: `${(outflowPct / 100) * half}px` }}
                title={`Outflow: ${Number(d.outflow || 0).toFixed(2)}`}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {d.date.slice(5)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AdminDashboard = () => {
  // Reference to satisfy eslint in some environments when using <motion.*>
  const __MOTION_REF__ = motion;
  const { auth } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [itemCount, setItemCount] = useState(0);

  const load = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const [ov, cf, itemsRes] = await Promise.all([
        fetchDashboardOverview(auth.token, params),
        fetchCashflowReport(auth.token, params),
        fetchItems(auth.token),
      ]);
      setOverview(ov.data);
      setCashflow(cf.data);
      setItemCount((itemsRes.data || []).length);
      // Show a quick toast only when user explicitly applies filters
      // (We trigger this from the button handler below)
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load dashboard";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const quickSet = (range) => {
    const now = new Date();
    const toD = now.toISOString().slice(0, 10);
    if (range === "today") {
      const f = toD;
      setFrom(f);
      setTo(toD);
    } else if (range === "month") {
      const f = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      setFrom(f);
      setTo(toD);
    } else {
      setFrom("");
      setTo("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
                  d="M3 3h18v6H3zM3 13h8v8H3zM13 13h8v8h-8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                Overview, cashflow, top items, and activity
              </p>
            </div>
          </div>
          <a
            href="/admin/reports"
            className="px-4 py-2 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow"
          >
            View Reports →
          </a>
        </div>

        {/* Filters */}
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
          <button
            onClick={async () => {
              await load();
              toast.success("Filters applied");
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-xl shadow hover:bg-yellow-700"
          >
            Apply
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => quickSet("today")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => quickSet("month")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              This Month
            </button>
            <button
              onClick={() => quickSet("all")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              All
            </button>
          </div>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-yellow-100/60 border border-yellow-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat
              label="Sales (total)"
              value={`Rs. ${number(overview?.kpis?.sales?.total)}`}
              accent="text-emerald-600"
            />
            <Stat
              label="Sales paid"
              value={`Rs. ${number(overview?.kpis?.sales?.paid)}`}
            />
            <Stat
              label="Sales outstanding"
              value={`Rs. ${number(overview?.kpis?.sales?.outstanding)}`}
              accent="text-rose-600"
            />
            <Stat
              label="Purchases (total)"
              value={`Rs. ${number(overview?.kpis?.purchases?.total)}`}
            />
            <Stat
              label="Expenses"
              value={`Rs. ${number(overview?.kpis?.expenses?.total)}`}
            />
            <Stat
              label="Net cashflow"
              value={`Rs. ${number(overview?.kpis?.net)}`}
              accent="text-indigo-600"
            />
            <Stat label="Master items" value={number(itemCount)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cashflow */}
          <Section
            title="Cashflow (Inflow vs Outflow)"
            right={
              <div className="text-sm text-gray-500">
                {cashflow.length} days
              </div>
            }
          >
            {loading ? (
              <div className="h-[140px] bg-yellow-100/60 rounded-2xl animate-pulse" />
            ) : cashflow.length ? (
              <MiniBarChart data={cashflow} />
            ) : (
              <div className="text-sm text-gray-500">No cashflow data</div>
            )}
          </Section>
          {/* Today snapshot */}
          <Section title="Today">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-yellow-100/60 border border-yellow-200"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Sales"
                  value={`Rs. ${number(overview?.today?.sales?.total)}`}
                />
                <Stat
                  label="Sales paid"
                  value={`Rs. ${number(overview?.today?.sales?.paid)}`}
                />
                <Stat
                  label="Purchases"
                  value={`Rs. ${number(overview?.today?.purchases?.total)}`}
                />
                <Stat
                  label="Suppliers paid"
                  value={`Rs. ${number(overview?.today?.purchases?.paid)}`}
                />
                <Stat
                  label="Income (rev)"
                  value={`Rs. ${number(overview?.today?.income?.revenue)}`}
                />
                <Stat
                  label="Expenses"
                  value={`Rs. ${number(overview?.today?.expenses?.total)}`}
                />
              </div>
            )}
          </Section>

          {/* Top items */}
          <Section
            title="Top Items"
            right={
              <a
                href="/admin/master-items"
                className="text-sm text-blue-600 hover:underline"
              >
                Manage master items →
              </a>
            }
          >
            {loading ? (
              <div className="h-40 bg-yellow-100/60 rounded-2xl animate-pulse" />
            ) : (overview?.topItems || []).length ? (
              <div className="divide-y">
                {(overview?.topItems || []).map((t, idx) => (
                  <div
                    key={t.item}
                    className="flex items-center justify-between py-2 gap-4"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-500 w-5">
                        {idx + 1}
                      </span>
                      <div className="truncate max-w-[60%]">{t.item}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-40 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(t.soldQty || 0) /
                                Math.max(
                                  1,
                                  ...(overview?.topItems || []).map((x) =>
                                    Number(x.soldQty || 0)
                                  )
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        Qty: {number(t.soldQty)} · Rs. {number(t.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No data</div>
            )}
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="Repairs status">
            {loading ? (
              <div className="h-28 bg-yellow-100/60 rounded-2xl animate-pulse" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(overview?.repairsByStatus || {}).map(
                  ([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-200 text-xs"
                    >
                      <span className="font-medium capitalize">{k}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-yellow-700 border border-yellow-200">
                        {Number(v) || 0}
                      </span>
                    </span>
                  )
                )}
                {Object.keys(overview?.repairsByStatus || {}).length === 0 && (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
            )}
          </Section>

          <Section title="Critical cases status">
            {loading ? (
              <div className="h-28 bg-yellow-100/60 rounded-2xl animate-pulse" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(overview?.criticalByStatus || {}).map(
                  ([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-200 text-xs"
                    >
                      <span className="font-medium capitalize">{k}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-yellow-700 border border-yellow-200">
                        {Number(v) || 0}
                      </span>
                    </span>
                  )
                )}
                {Object.keys(overview?.criticalByStatus || {}).length === 0 && (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
            )}
          </Section>

          <Section title="Recent activity">
            {loading ? (
              <div className="h-40 bg-yellow-100/60 rounded-2xl animate-pulse" />
            ) : (overview?.recent || []).length ? (
              <div className="divide-y">
                {(overview?.recent || []).map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 truncate">
                        {r.type}
                      </span>
                      <span className="text-gray-600 truncate">
                        {r.detail || ""}
                      </span>
                    </div>
                    <div className="text-gray-500 whitespace-nowrap">
                      {new Date(r.date).toLocaleString()}
                    </div>
                    <div className="font-medium whitespace-nowrap">
                      {r.amount ? `Rs. ${number(r.amount)}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No activity</div>
            )}
          </Section>
        </div>

        {loading && <div className="text-sm text-gray-500">Loading…</div>}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
