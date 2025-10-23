import React, { useEffect, useState } from "react";
import { shopListTickets, shopDeleteTicket } from "../../../api/shopTickets";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function ShopTickets() {
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
        const res = await shopListTickets(token);
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const onDelete = async (id) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Delete this ticket?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    await shopDeleteTicket(token, id);
    setRows((prev) => prev.filter((r) => r._id !== id));
    toast.success("Ticket deleted");
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
            Tickets
          </h1>
          <Link
            to="/shop/tickets/new"
            className="bg-yellow-600 text-white px-3 py-1.5 rounded-xl shadow hover:bg-yellow-700"
          >
            New
          </Link>
        </div>
        {/* Desktop/tablet table */}
        <div className="bg-white/80 rounded-2xl shadow border border-yellow-200 overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-yellow-50 text-yellow-800">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Priority</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="p-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-yellow-100">
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">
                    <div
                      className="max-w-[360px] truncate"
                      title={r.description || ""}
                    >
                      {r.description || "-"}
                    </div>
                  </td>
                  <td className="p-3 capitalize">{r.priority}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${
                        r.status === "open"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onDelete(r._id)}
                      className="text-rose-700 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-gray-500 text-center">
                    {loading ? "Loading..." : "No tickets"}
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
                    r.status === "open"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.description && (
                <div className="text-xs text-gray-700 truncate mb-1">
                  Desc: {r.description}
                </div>
              )}
              <div className="text-xs text-gray-600 mb-2">
                Priority: <span className="capitalize">{r.priority}</span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              <div className="mt-2 text-right">
                <button
                  onClick={() => onDelete(r._id)}
                  className="px-3 py-1.5 rounded-xl bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 shadow text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-8">
              {loading ? "Loading..." : "No tickets"}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
