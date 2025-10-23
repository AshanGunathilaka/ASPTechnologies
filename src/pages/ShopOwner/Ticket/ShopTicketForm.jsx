import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shopCreateTicket } from "../../../api/shopTickets";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function ShopTicketForm() {
  const { auth } = useShopAuth();
  const __MOTION_REF__ = motion;
  const token = auth?.token;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await shopCreateTicket(token, form);
      toast.success("Ticket created");
      navigate("/shop/tickets");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create ticket");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto bg-white/80 rounded-2xl p-6 shadow border border-yellow-200">
        <div className="flex items-center justify-between mb-4 gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow text-sm"
          >
            Back
          </button>
          <h1 className="text-2xl font-bold text-yellow-800">New Ticket</h1>
          <div className="w-[64px]" />
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Title</label>
            <input
              className="border border-yellow-200 rounded-xl w-full p-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Description</label>
            <textarea
              className="border border-yellow-200 rounded-xl w-full p-2"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Priority</label>
            <select
              className="border border-yellow-200 rounded-xl w-full p-2"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-700">
              Create
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
