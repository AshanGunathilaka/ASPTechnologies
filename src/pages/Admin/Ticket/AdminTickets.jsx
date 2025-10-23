import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { adminListTickets, adminDeleteTicket } from "../../../api/tickets";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminTickets() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await adminListTickets(token);
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this ticket?",
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
      await adminDeleteTicket(token, id);
      setRows((prev) => prev.filter((r) => r._id !== id));
      toast.success("Ticket deleted");
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
              Tickets
            </h1>
            <p className="text-gray-500 text-sm">
              Manage support tickets from shops
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/tickets/new"
            className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            New
          </Link>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-yellow-50 text-yellow-800">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Shop</th>
              <th className="text-left p-3">Priority</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r._id}
                className="border-t border-yellow-100 hover:bg-yellow-50/50"
              >
                <td className="p-3">
                  <Link
                    className="text-yellow-700 hover:underline font-medium"
                    to={`/admin/tickets/${r._id}/detail`}
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="p-3">{r.shop?.name || "-"}</td>
                <td className="p-3">
                  <span
                    className="inline-flex px-2 py-1 rounded text-xs border"
                    style={{
                      backgroundColor:
                        r.priority === "high"
                          ? "#FEF2F2"
                          : r.priority === "low"
                          ? "#ECFDF5"
                          : "#FFFBEB",
                      color:
                        r.priority === "high"
                          ? "#B91C1C"
                          : r.priority === "low"
                          ? "#065F46"
                          : "#92400E",
                      borderColor:
                        r.priority === "high"
                          ? "#FECACA"
                          : r.priority === "low"
                          ? "#A7F3D0"
                          : "#FDE68A",
                    }}
                  >
                    {r.priority}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 capitalize">
                    {r.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="p-3 flex gap-2">
                  <Link
                    to={`/admin/tickets/${r._id}`}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(r._id)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-gray-500">
                  {loading ? "Loading..." : "No tickets"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
