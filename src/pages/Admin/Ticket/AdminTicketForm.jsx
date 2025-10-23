import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  adminCreateTicket,
  adminGetTicket,
  adminUpdateTicket,
} from "../../../api/tickets";
import { fetchShops } from "../../../api/shops";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminTicketForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [shops, setShops] = useState([]);
  const [form, setForm] = useState({
    shop: "",
    title: "",
    description: "",
    priority: "medium",
    status: "open",
  });

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const s = await fetchShops(token);
        setShops(s.data || []);
        if (ticketId) {
          const res = await adminGetTicket(token, ticketId);
          const t = res.data;
          setForm({
            shop: t.shop?._id || t.shop || "",
            title: t.title || "",
            description: t.description || "",
            priority: t.priority || "medium",
            status: t.status || "open",
          });
        }
      } catch {
        // Optional: ignore load errors here
      }
    };
    load();
  }, [token, ticketId]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (ticketId) {
        await adminUpdateTicket(token, ticketId, form);
        toast.success("Ticket updated");
      } else {
        await adminCreateTicket(token, form);
        toast.success("Ticket created");
      }
      navigate("/admin/tickets");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
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
              {ticketId ? "Edit Ticket" : "New Ticket"}
            </h1>
            <p className="text-gray-500 text-sm">
              Fill the ticket details below
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
          {ticketId && (
            <Link
              to={`/admin/tickets/${ticketId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="max-w-2xl mx-auto space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200"
      >
        <div>
          <label className="block text-sm text-gray-600">Shop</label>
          <select
            className="border rounded w-full p-2"
            value={form.shop}
            onChange={(e) => setForm({ ...form, shop: e.target.value })}
            required
          >
            <option value="">Select shop</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Title</label>
          <input
            className="border rounded w-full p-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Description</label>
          <textarea
            className="border rounded w-full p-2"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Priority</label>
            <select
              className="border rounded w-full p-2"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Status</label>
            <select
              className="border rounded w-full p-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow">
            Save
          </button>
        </div>
      </form>
    </motion.div>
  );
}
