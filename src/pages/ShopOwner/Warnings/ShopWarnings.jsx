import React, { useEffect, useState } from "react";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { shopListWarnings } from "../../../api/shopWarnings";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

export default function ShopWarnings() {
  const { auth } = useShopAuth();
  const __MOTION_REF__ = motion;
  const token = auth?.token;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await shopListWarnings(token);
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
            Warnings
          </h1>
        </div>
        {/* Desktop/tablet table */}
        <div className="bg-white/80 rounded-2xl shadow border border-yellow-200 overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-yellow-50 text-yellow-800">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Message</th>
                <th className="text-right p-3">Bills</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-yellow-100">
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">
                    <div
                      className="max-w-[320px] truncate"
                      title={r.message || ""}
                    >
                      {r.message || "-"}
                    </div>
                  </td>
                  <td className="p-3 text-right">{r.bills?.length || 0}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${
                        r.status === "active"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-gray-500 text-center">
                    {loading ? "Loading..." : "No warnings"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {rows.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-semibold text-yellow-800 truncate">
                  {r.title}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    r.status === "active"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.message && (
                <div className="text-xs text-gray-700 truncate mb-1">
                  Message: {r.message}
                </div>
              )}

              <div className="text-xs text-gray-500">
                {r.bills?.length || 0} bill(s) •{" "}
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-8">
              {loading ? "Loading..." : "No warnings"}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
