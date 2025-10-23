import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { adminDeleteOrder, adminListOrders } from "../../../api/orders";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminOrders() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await adminListOrders(token);
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#f9fafb",
      backdrop: `rgba(0,0,0,0.4)`,
    });
    if (!result.isConfirmed) return;
    try {
      await adminDeleteOrder(token, id);
      setRows((prev) => prev.filter((r) => r._id !== id));
      toast.success("Order deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
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
              Orders
            </h1>
            <p className="text-gray-500 text-sm">Track and manage orders</p>
          </div>
        </div>
        <Link
          to="/admin/orders/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500"
        >
          New Order
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="text-left p-3">Order #</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Shop</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Qty</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">
                    <Link
                      className="text-yellow-700 hover:underline font-medium"
                      to={`/admin/orders/${r._id}/detail`}
                    >
                      {r.orderNumber || "-"}
                    </Link>
                  </td>
                  <td className="p-3 capitalize">{r.type}</td>
                  <td className="p-3">{r.shop?.name || "-"}</td>
                  <td className="p-3">
                    {r.type === "item" ? r.item?.name : r.offer?.title}
                  </td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3">
                    <span className="capitalize inline-flex px-2 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 space-x-3">
                    <Link
                      to={`/admin/orders/${r._id}`}
                      className="text-yellow-700 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(r._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-gray-500">
                    {loading ? "Loading..." : "No orders"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
