import React, { useEffect, useState } from "react";
import {
  shopListRepairs,
  shopSearchRepairsByImei,
} from "../../../api/shopRepairs";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function ShopRepairs() {
  const { auth } = useShopAuth();
  const __MOTION_REF__ = motion;
  const token = auth?.token;
  const [rows, setRows] = useState([]);
  const [imei, setImei] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const res = await shopListRepairs(token);
      setRows(res.data);
    };
    load();
  }, [token]);

  const search = async (e) => {
    e.preventDefault();
    if (!imei || imei.trim().length < 3)
      return toast.error("Enter min 3 chars");
    const res = await shopSearchRepairsByImei(token, imei.trim());
    setRows(res.data);
  };

  const reset = async () => {
    setImei("");
    const res = await shopListRepairs(token);
    setRows(res.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
            Warranties
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <form
              onSubmit={search}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder="Search IMEI..."
                className="border border-yellow-200 rounded-xl px-3 py-2 w-full sm:w-64"
              />
              <button className="bg-blue-600 text-white px-3 py-2 rounded-xl">
                Search
              </button>
              <button
                type="button"
                onClick={reset}
                className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl"
              >
                Reset
              </button>
            </form>
            <Link
              to="/shop/repairs/new"
              className="bg-yellow-600 text-white px-3 py-2 rounded-xl shadow hover:bg-yellow-700 text-center"
            >
              New
            </Link>
          </div>
        </div>
        {/* Desktop/tablet table */}
        <div className="bg-white/80 rounded-2xl shadow border border-yellow-200 overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-yellow-50 text-yellow-800">
              <tr>
                <th className="text-left p-3">Job Sheet #</th>
                <th className="text-left p-3">Phone Model</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-yellow-100">
                  <td className="p-3">{r.jobSheetNumber}</td>
                  <td className="p-3">{r.phoneModel}</td>
                  <td className="p-3">{r.customerName}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      to={`/shop/repairs/${r._id}`}
                      className="px-3 py-1.5 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500 text-center" colSpan={6}>
                    No records
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
                <div className="font-semibold text-yellow-800">
                  {r.jobSheetNumber}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200 capitalize">
                  {r.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {r.phoneModel} • {r.customerName}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
              <div className="text-right">
                <Link
                  to={`/shop/repairs/${r._id}`}
                  className="px-3 py-1.5 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
                >
                  View
                </Link>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-8">
              No records
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
