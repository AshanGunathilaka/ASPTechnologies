import React, { useEffect, useState } from "react";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { shopListOrders, shopDeleteOrder } from "../../../api/shopOrders";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function ShopOrders() {
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
        const res = await shopListOrders(token);
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const remove = async (id) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Delete this order?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    await shopDeleteOrder(token, id);
    setRows((prev) => prev.filter((r) => r._id !== id));
    toast.success("Order deleted");
  };

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
            My Orders
          </h1>
        </div>
        {/* Desktop/tablet table */}
        <div className="bg-white/80 rounded-2xl shadow border border-yellow-200 overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-yellow-50 text-yellow-800">
              <tr>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Note</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-yellow-100">
                  <td className="p-3 capitalize">{r.type}</td>
                  <td className="p-3">
                    {r.type === "item" ? r.item?.name : r.offer?.title}
                  </td>
                  <td className="p-3">
                    <div
                      className="max-w-[280px] truncate"
                      title={r.note || ""}
                    >
                      {r.note || "-"}
                    </div>
                  </td>
                  <td className="p-3 text-right">{r.quantity}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${
                        r.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => remove(r._id)}
                      className="text-rose-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-gray-500 text-center">
                    {loading ? "Loading..." : "No orders"}
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
                  {r.type === "item" ? r.item?.name : r.offer?.title}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    r.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : r.status === "rejected"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                <span className="capitalize">{r.type}</span> • Qty: {r.quantity}{" "}
                • {new Date(r.createdAt).toLocaleString()}
              </div>
              {r.note && (
                <div className="text-xs text-gray-600 truncate mb-2">
                  Note: {r.note}
                </div>
              )}
              <div className="mt-2 text-right">
                <button
                  onClick={() => remove(r._id)}
                  className="px-3 py-1.5 rounded-xl bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-8">
              {loading ? "Loading..." : "No orders"}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
