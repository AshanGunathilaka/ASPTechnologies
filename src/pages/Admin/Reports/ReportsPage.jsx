import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  fetchSummaryReport,
  fetchCashflowReport,
  fetchTopItemsReport,
} from "../../../api/reports";
import {
  fetchProfitReport,
  fetchProfitItemsReport,
} from "../../../api/reports";

export default function ReportsPage() {
  // Reference for eslint when using <motion.*>
  const __MOTION_REF__ = motion;
  const { auth } = useAuth();
  const token = auth?.token;
  const [tab, setTab] = useState("summary");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summary, setSummary] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [profitRows, setProfitRows] = useState([]);
  const [profitItems, setProfitItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === "summary") {
        const res = await fetchSummaryReport(token, { from, to });
        setSummary(res.data);
      } else if (tab === "cashflow") {
        const res = await fetchCashflowReport(token, { from, to });
        setCashflow(res.data || []);
      } else if (tab === "top") {
        const res = await fetchTopItemsReport(token, { from, to, limit: 10 });
        setTopItems(res.data || []);
      } else if (tab === "profit") {
        const [monthlyRes, itemsRes] = await Promise.all([
          fetchProfitReport(token, { from, to }),
          fetchProfitItemsReport(token, { from, to }),
        ]);
        setProfitRows(monthlyRes.data || []);
        setProfitItems(itemsRes.data || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [tab, from, to, token]);
  // Helpers
  const formatCurrency = useCallback((n) => {
    const num = Number(n || 0);
    return `${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} LKR`;
  }, []);

  const applyFilters = useCallback(async () => {
    await load();
    toast.success("Filters applied");
  }, [load]);

  const toISO = (d) => d.toISOString().slice(0, 10);
  const setQuickRange = (key) => {
    const now = new Date();
    const end = toISO(now);
    let start = end;
    if (key === "7") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      start = toISO(d);
    } else if (key === "30") {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      start = toISO(d);
    } else if (tab === "profit") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = toISO(d);
    } else if (key === "today") {
      start = end;
    }
    setFrom(start);
    setTo(end);
  };

  const exportCsv = (filename, columns, data) => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = columns.map((c) => esc(c.label)).join(",");
    const lines = data
      .map((row) =>
        columns
          .map((c) =>
            esc(c.format ? c.format(row[c.field], row) : row[c.field])
          )
          .join(",")
      )
      .join("\n");
    const csv = `${header}\n${lines}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (tab === "summary" && summary) {
      const cols = [
        { label: "Metric", field: "metric" },
        { label: "Value", field: "value" },
      ];
      const data = [
        { metric: "Sales Total", value: formatCurrency(summary.sales.total) },
        { metric: "Sales Bills", value: summary.sales.billsCount },
        { metric: "Items Sold", value: summary.sales.itemsSold },
        {
          metric: "Payments Received",
          value: formatCurrency(summary.sales.paymentsReceived),
        },
        {
          metric: "Sales Outstanding",
          value: formatCurrency(summary.sales.outstanding),
        },
        {
          metric: "Purchases Total",
          value: formatCurrency(summary.purchases.total),
        },
        { metric: "Purchase Invoices", value: summary.purchases.invoicesCount },
        {
          metric: "Payments to Suppliers",
          value: formatCurrency(summary.purchases.paymentsToSuppliers),
        },
        {
          metric: "Purchases Outstanding",
          value: formatCurrency(summary.purchases.outstanding),
        },
        {
          metric: "Additional Income Revenue",
          value: formatCurrency(summary.additionalIncome.revenue),
        },
        {
          metric: "Additional Income Profit",
          value: formatCurrency(summary.additionalIncome.profit),
        },
        {
          metric: "Expenses Total",
          value: formatCurrency(summary.expenses.total),
        },
      ];
      exportCsv(`summary_${from || "all"}_${to || "all"}.csv`, cols, data);
    } else if (tab === "cashflow") {
      const cols = [
        { label: "Date", field: "date" },
        {
          label: "Inflow",
          field: "inflow",
          format: (v) => Number(v).toFixed(2),
        },
        {
          label: "Outflow",
          field: "outflow",
          format: (v) => Number(v).toFixed(2),
        },
        { label: "Net", field: "net", format: (v) => Number(v).toFixed(2) },
      ];
      exportCsv(`cashflow_${from || "all"}_${to || "all"}.csv`, cols, cashflow);
    } else if (tab === "top") {
      const cols = [
        { label: "Item", field: "item" },
        { label: "Sold Qty", field: "soldQty" },
      ];
      exportCsv(
        `top_items_${from || "all"}_${to || "all"}.csv`,
        cols,
        topItems
      );
    } else if (tab === "profit") {
      const cols = [
        { label: "Month", field: "month" },
        {
          label: "Revenue",
          field: "revenue",
          format: (v) => Number(v).toFixed(2),
        },
        { label: "Cost", field: "cost", format: (v) => Number(v).toFixed(2) },
        {
          label: "Profit",
          field: "profit",
          format: (v) => Number(v).toFixed(2),
        },
        {
          label: "Margin %",
          field: "margin",
          format: (v) => (Number(v) * 100).toFixed(2) + "%",
        },
      ];
      exportCsv(`profit_${from || "all"}_${to || "all"}.csv`, cols, profitRows);
    }
    toast.success("Exported CSV");
  };

  // Derived
  const netCashFlow = useMemo(() => {
    if (!summary) return 0;
    const inflow =
      Number(summary.sales.paymentsReceived || 0) +
      Number(summary.additionalIncome.profit || 0);
    const outflow =
      Number(summary.purchases.paymentsToSuppliers || 0) +
      Number(summary.expenses.total || 0);
    return inflow - outflow;
  }, [summary]);

  const maxSold = useMemo(() => {
    return Math.max(1, ...topItems.map((t) => Number(t.soldQty || 0)));
  }, [topItems]);

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
                Reports
              </h1>
              <p className="text-gray-500 text-sm">
                Summary, cashflow, profit, and top items
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
                tab === "cashflow"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
              onClick={() => setTab("cashflow")}
            >
              Cashflow
            </button>
            <button
              className={`px-3 py-1 rounded-xl shadow border ${
                tab === "top"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
              onClick={() => setTab("top")}
            >
              Top Items
            </button>
            <button
              className={`px-3 py-1 rounded-xl shadow border ${
                tab === "profit"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
              onClick={() => setTab("profit")}
            >
              Profit
            </button>
          </div>
        </div>

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
          <div className="flex gap-2">
            <button
              onClick={() => setQuickRange("today")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => setQuickRange("7")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setQuickRange("30")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setQuickRange("month")}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            >
              This month
            </button>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={applyFilters}
              className="bg-yellow-600 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-700"
            >
              Apply
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow"
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-yellow-100 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-28 bg-yellow-100/60 rounded-2xl"></div>
              <div className="h-28 bg-yellow-100/60 rounded-2xl"></div>
              <div className="h-28 bg-yellow-100/60 rounded-2xl"></div>
              <div className="h-28 bg-yellow-100/60 rounded-2xl"></div>
            </div>
            <div className="h-64 bg-yellow-100/60 rounded-2xl"></div>
          </div>
        ) : tab === "summary" ? (
          summary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-xs text-gray-500">Sales Total</div>
                  <div className="mt-1 text-xl font-semibold text-yellow-800">
                    {formatCurrency(summary.sales.total)}
                  </div>
                </div>
                <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-xs text-gray-500">Expenses Total</div>
                  <div className="mt-1 text-xl font-semibold text-yellow-800">
                    {formatCurrency(summary.expenses.total)}
                  </div>
                </div>
                <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-xs text-gray-500">
                    Additional Income Profit
                  </div>
                  <div className="mt-1 text-xl font-semibold text-yellow-800">
                    {formatCurrency(summary.additionalIncome.profit)}
                  </div>
                </div>
                <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-xs text-gray-500">Net Cash Flow</div>
                  <div
                    className={`mt-1 text-xl font-semibold ${
                      netCashFlow >= 0 ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {formatCurrency(netCashFlow)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                  <h2 className="font-semibold mb-2 text-yellow-800">Sales</h2>
                  <div>Total: {formatCurrency(summary.sales.total)}</div>
                  <div>Bills: {summary.sales.billsCount}</div>
                  <div>Items Sold: {summary.sales.itemsSold}</div>
                  <div>
                    Payments Received:{" "}
                    {formatCurrency(summary.sales.paymentsReceived)}
                  </div>
                  <div>
                    Outstanding: {formatCurrency(summary.sales.outstanding)}
                  </div>
                </div>
                <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                  <h2 className="font-semibold mb-2 text-yellow-800">
                    Purchases
                  </h2>
                  <div>Total: {formatCurrency(summary.purchases.total)}</div>
                  <div>Invoices: {summary.purchases.invoicesCount}</div>
                  <div>
                    Payments to Suppliers:{" "}
                    {formatCurrency(summary.purchases.paymentsToSuppliers)}
                  </div>
                  <div>
                    Outstanding: {formatCurrency(summary.purchases.outstanding)}
                  </div>
                </div>
                <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                  <h2 className="font-semibold mb-2 text-yellow-800">
                    Additional Income
                  </h2>
                  <div>
                    Revenue: {formatCurrency(summary.additionalIncome.revenue)}
                  </div>
                  <div>
                    Profit: {formatCurrency(summary.additionalIncome.profit)}
                  </div>
                </div>
                <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                  <h2 className="font-semibold mb-2 text-yellow-800">
                    Expenses
                  </h2>
                  <div>Total: {formatCurrency(summary.expenses.total)}</div>
                </div>
                <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                  <h2 className="font-semibold mb-2 text-yellow-800">
                    Repairs (by Status)
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.repairs?.byStatus || {}).map(
                      ([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-200 text-xs"
                        >
                          <span className="font-medium capitalize">{key}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-yellow-700 border border-yellow-200">
                            {Number(val) || 0}
                          </span>
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                  <h2 className="font-semibold mb-2 text-yellow-800">
                    Critical Cases
                  </h2>
                  <div className="text-sm mb-1">By Status:</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(summary.criticalCases?.byStatus || {}).map(
                      ([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-200 text-xs"
                        >
                          <span className="font-medium capitalize">{key}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-yellow-700 border border-yellow-200">
                            {Number(val) || 0}
                          </span>
                        </span>
                      )
                    )}
                  </div>
                  <div className="text-sm mb-1">By Severity:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      summary.criticalCases?.bySeverity || {}
                    ).map(([key, val]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-200 text-xs"
                      >
                        <span className="font-medium capitalize">{key}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-yellow-700 border border-yellow-200">
                          {Number(val) || 0}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
              <div className="text-lg font-semibold mb-1">
                No summary to display
              </div>
              <div className="text-sm">Adjust date filters and try again.</div>
            </div>
          )
        ) : tab === "cashflow" ? (
          cashflow.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
                <thead className="bg-yellow-50 text-yellow-800 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Inflow</th>
                    <th className="text-right p-3">Outflow</th>
                    <th className="text-right p-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {cashflow.map((r) => (
                    <tr
                      key={r.date}
                      className="border-t border-yellow-100 hover:bg-yellow-50/40"
                    >
                      <td className="p-3">{r.date}</td>
                      <td className="p-3 text-right">
                        {Number(r.inflow).toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        {Number(r.outflow).toFixed(2)}
                      </td>
                      <td
                        className={`p-3 text-right font-medium ${
                          Number(r.net) >= 0
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {Number(r.net).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
              <div className="text-lg font-semibold mb-1">
                No cashflow records
              </div>
              <div className="text-sm">Try expanding your date range.</div>
            </div>
          )
        ) : tab === "profit" ? (
          profitRows.length ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {(() => {
                  const totals = profitRows.reduce(
                    (acc, r) => ({
                      revenue: acc.revenue + Number(r.revenue || 0),
                      cost: acc.cost + Number(r.cost || 0),
                      profit: acc.profit + Number(r.profit || 0),
                    }),
                    { revenue: 0, cost: 0, profit: 0 }
                  );
                  // Use item-wise cost to reflect total sold item cost (supplier unit price * qty)
                  const itemsCostTotal = profitItems.reduce(
                    (acc, r) => acc + Number(r.cost || 0),
                    0
                  );
                  const margin = totals.revenue
                    ? totals.profit / totals.revenue
                    : 0;
                  return (
                    <>
                      <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">
                          Total Revenue
                        </div>
                        <div className="mt-1 text-xl font-semibold text-yellow-800">
                          {formatCurrency(totals.revenue)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">
                          Total Sold Item Cost
                        </div>
                        <div className="mt-1 text-xl font-semibold text-yellow-800">
                          {formatCurrency(itemsCostTotal)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">
                          Total Profit
                        </div>
                        <div className="mt-1 text-xl font-semibold text-emerald-700">
                          {formatCurrency(totals.profit)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">
                          Average Margin
                        </div>
                        <div
                          className={`mt-1 text-xl font-semibold ${
                            margin >= 0 ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {(margin * 100).toFixed(2)}%
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
                  <thead className="bg-yellow-50 text-yellow-800 sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3">Month</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Cost</th>
                      <th className="text-right p-3">Profit</th>
                      <th className="text-right p-3">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitRows.map((r) => (
                      <tr
                        key={r.month}
                        className="border-t border-yellow-100 hover:bg-yellow-50/40"
                      >
                        <td className="p-3">{r.month}</td>
                        <td className="p-3 text-right">
                          {Number(r.revenue).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          {Number(r.cost).toFixed(2)}
                        </td>
                        <td
                          className={`p-3 text-right font-medium ${
                            Number(r.profit) >= 0
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          {Number(r.profit).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          {(Number(r.margin) * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Item-wise Profit */}
              <div className="border border-yellow-200 rounded-2xl p-4 bg-white/70">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-yellow-800">
                    Item-wise Profit
                  </h2>
                  {profitItems.length > 0 && (
                    <button
                      onClick={() => {
                        const cols = [
                          { label: "Item", field: "item" },
                          { label: "Sold Qty", field: "soldQty" },
                          {
                            label: "Revenue",
                            field: "revenue",
                            format: (v) => Number(v).toFixed(2),
                          },
                          {
                            label: "Cost",
                            field: "cost",
                            format: (v) => Number(v).toFixed(2),
                          },
                          {
                            label: "Profit",
                            field: "profit",
                            format: (v) => Number(v).toFixed(2),
                          },
                          {
                            label: "Margin %",
                            field: "margin",
                            format: (v) => (Number(v) * 100).toFixed(2) + "%",
                          },
                        ];
                        exportCsv(
                          `profit_items_${from || "all"}_${to || "all"}.csv`,
                          cols,
                          profitItems
                        );
                        toast.success("Exported Items CSV");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow"
                    >
                      Export Items CSV
                    </button>
                  )}
                </div>
                {profitItems.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
                      <thead className="bg-yellow-50 text-yellow-800 sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-3">Item</th>
                          <th className="text-right p-3">Sold Qty</th>
                          <th className="text-right p-3">Revenue</th>
                          <th className="text-right p-3">Cost</th>
                          <th className="text-right p-3">Profit</th>
                          <th className="text-right p-3">Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitItems.map((r) => (
                          <tr
                            key={r.item}
                            className="border-t border-yellow-100 hover:bg-yellow-50/40"
                          >
                            <td className="p-3">{r.item}</td>
                            <td className="p-3 text-right">
                              {Number(r.soldQty).toFixed(0)}
                            </td>
                            <td className="p-3 text-right">
                              {Number(r.revenue).toFixed(2)}
                            </td>
                            <td className="p-3 text-right">
                              {Number(r.cost).toFixed(2)}
                            </td>
                            <td
                              className={`p-3 text-right font-medium ${
                                Number(r.profit) >= 0
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {Number(r.profit).toFixed(2)}
                            </td>
                            <td className="p-3 text-right">
                              {(Number(r.margin) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-yellow-50/40 border-t border-yellow-100">
                          <td className="p-3 font-medium">Totals</td>
                          <td className="p-3 text-right font-medium">
                            {profitItems
                              .reduce((a, r) => a + Number(r.soldQty || 0), 0)
                              .toFixed(0)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {profitItems
                              .reduce((a, r) => a + Number(r.revenue || 0), 0)
                              .toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {profitItems
                              .reduce((a, r) => a + Number(r.cost || 0), 0)
                              .toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {profitItems
                              .reduce((a, r) => a + Number(r.profit || 0), 0)
                              .toFixed(2)}
                          </td>
                          <td className="p-3 text-right text-gray-500">—</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    No item-wise data in this range.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
              <div className="text-lg font-semibold mb-1">No profit data</div>
              <div className="text-sm">Try expanding your date range.</div>
            </div>
          )
        ) : topItems.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-yellow-200 rounded-xl overflow-hidden">
              <thead className="bg-yellow-50 text-yellow-800 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Item</th>
                  <th className="text-right p-3">Sold Qty</th>
                  <th className="text-left p-3">Share</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((r, idx) => (
                  <tr
                    key={r.item}
                    className="border-t border-yellow-100 hover:bg-yellow-50/40"
                  >
                    <td className="p-3 text-gray-500">{idx + 1}</td>
                    <td className="p-3">{r.item}</td>
                    <td className="p-3 text-right">{r.soldQty}</td>
                    <td className="p-3">
                      <div className="w-40 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{
                            width: `${
                              (Number(r.soldQty || 0) / maxSold) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
            <div className="text-lg font-semibold mb-1">No top items yet</div>
            <div className="text-sm">
              Select a wider period to see best sellers.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
