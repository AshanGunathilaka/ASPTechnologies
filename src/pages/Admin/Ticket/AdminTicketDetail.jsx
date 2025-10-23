import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { adminDeleteTicket, adminGetTicket } from "../../../api/tickets";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminTicketDetail() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await adminGetTicket(token, ticketId);
        setTicket(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, ticketId]);

  const onDelete = async () => {
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
      await adminDeleteTicket(token, ticketId);
      toast.success("Ticket deleted");
      navigate("/admin/tickets");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const label = (t) => <span className="text-gray-500 text-sm">{t}</span>;

  const priorityBadge = (p) => {
    const styles = {
      high: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
      low: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
      medium: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
    };
    const s = styles[p] || styles.medium;
    return (
      <span
        className="inline-flex px-2 py-1 rounded text-xs border"
        style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
      >
        {p}
      </span>
    );
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
              Ticket Details
            </h1>
            <p className="text-gray-500 text-sm">
              Review the ticket information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/tickets"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {ticket && (
            <Link
              to={`/admin/tickets/${ticket._id}`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Edit
            </Link>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-5">
        {loading && <div className="text-gray-500">Loading...</div>}
        {!loading && !ticket && <div className="text-gray-500">Not found</div>}
        {ticket && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {label("Title")}
              <div className="text-xl font-semibold">{ticket.title}</div>
            </div>
            <div>
              {label("Priority")}
              <div>{priorityBadge(ticket.priority)}</div>
            </div>
            <div>
              {label("Status")}
              <div className="capitalize inline-flex px-2 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                {ticket.status?.replace("_", " ")}
              </div>
            </div>
            <div>
              {label("Shop")}
              <div>{ticket.shop?.name || "-"}</div>
            </div>
            <div className="sm:col-span-2">
              {label("Description")}
              <div className="whitespace-pre-wrap text-gray-700">
                {ticket.description || "-"}
              </div>
            </div>
            <div>
              {label("Created")}
              <div>{new Date(ticket.createdAt).toLocaleString()}</div>
            </div>
            <div>
              {label("Updated")}
              <div>{new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
