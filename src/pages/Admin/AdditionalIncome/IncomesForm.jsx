import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addIncomeEntry,
  getIncomeDay,
  updateIncomeDay,
} from "../../../api/incomes";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function IncomesForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { incomeId } = useParams();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [noteDay, setNoteDay] = useState("");
  const [entries, setEntries] = useState([
    {
      title: "",
      quantity: 1,
      buyPrice: "",
      sellPrice: "",
      customer: "",
      category: "",
      note: "",
    },
  ]);

  const loadExisting = useCallback(async () => {
    if (!incomeId) return;
    try {
      const res = await getIncomeDay(token, incomeId);
      const d = res.data;
      setDate(new Date(d.date).toISOString().slice(0, 10));
      setNoteDay(d.noteDay || "");
      setEntries(
        (d.entries || []).map((e) => ({
          title: e.title || "",
          quantity: e.quantity ?? 1,
          buyPrice: e.buyPrice ?? "",
          sellPrice: e.sellPrice ?? "",
          customer: e.customer || "",
          category: e.category || "",
          note: e.note || "",
        }))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load income day");
    }
  }, [incomeId, token]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const change = (i, field, value) =>
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    );
  const addRow = () =>
    setEntries((prev) => [
      ...prev,
      {
        title: "",
        quantity: 1,
        buyPrice: "",
        sellPrice: "",
        customer: "",
        category: "",
        note: "",
      },
    ]);
  const removeRow = (i) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (incomeId) {
        const payload = {
          date,
          noteDay,
          entries: entries.map((e) => ({
            title: e.title,
            quantity: Number(e.quantity || 0),
            buyPrice: Number(e.buyPrice || 0),
            sellPrice: Number(e.sellPrice || 0),
            customer: e.customer,
            category: e.category,
            note: e.note,
          })),
        };
        await updateIncomeDay(token, incomeId, payload);
        toast.success("Income day updated");
      } else {
        for (const ent of entries) {
          if (!ent.title || ent.buyPrice === "" || ent.sellPrice === "")
            continue;
          await addIncomeEntry(token, {
            date,
            title: ent.title,
            quantity: Number(ent.quantity || 1),
            buyPrice: Number(ent.buyPrice || 0),
            sellPrice: Number(ent.sellPrice || 0),
            customer: ent.customer,
            category: ent.category,
            note: ent.note,
            noteDay,
          });
        }
        toast.success("Income saved");
      }
      navigate("/admin/incomes");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save income");
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
              {incomeId
                ? "Edit Additional Income (Day)"
                : "Add Additional Income"}
            </h1>
            <p className="text-gray-500 text-sm">
              Fill the additional income details below
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/incomes"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {incomeId && (
            <Link
              to={`/admin/incomes/${incomeId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-6 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-yellow-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 outline-none p-2.5 rounded-lg transition-all duration-200"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Day Note (optional)
            </label>
            <input
              type="text"
              value={noteDay}
              onChange={(e) => setNoteDay(e.target.value)}
              className="w-full border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 outline-none p-2.5 rounded-lg transition-all duration-200"
              placeholder="Any overall note for the day"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 font-semibold text-sm text-gray-700 border-b border-yellow-200 pb-2">
            <div className="col-span-3">Title</div>
            <div className="col-span-1 text-right">Qty</div>
            <div className="col-span-2 text-right">Buy</div>
            <div className="col-span-2 text-right">Sell</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Category</div>
          </div>

          {entries.map((en, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center bg-yellow-50/40 p-2 rounded-xl hover:shadow-md transition-all duration-200"
            >
              <input
                className="col-span-3 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg transition-all duration-200"
                placeholder="Title"
                value={en.title}
                onChange={(e) => change(idx, "title", e.target.value)}
                required
              />
              <input
                type="number"
                className="col-span-1 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg text-right"
                value={en.quantity}
                min="0"
                onChange={(e) => change(idx, "quantity", e.target.value)}
              />
              <input
                type="number"
                className="col-span-2 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg text-right"
                placeholder="0.00"
                value={en.buyPrice}
                onChange={(e) => change(idx, "buyPrice", e.target.value)}
                required
              />
              <input
                type="number"
                className="col-span-2 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg text-right"
                placeholder="0.00"
                value={en.sellPrice}
                onChange={(e) => change(idx, "sellPrice", e.target.value)}
                required
              />
              <input
                className="col-span-2 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg"
                placeholder="Customer"
                value={en.customer}
                onChange={(e) => change(idx, "customer", e.target.value)}
              />
              <div className="col-span-2 flex gap-2">
                <input
                  className="w-full border border-yellow-300 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 p-2 rounded-lg outline-none"
                  placeholder="Category"
                  value={en.category}
                  onChange={(e) => change(idx, "category", e.target.value)}
                />

                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-red-600 hover:text-red-800 font-bold transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="col-span-12">
                <input
                  className="w-full border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg transition-all duration-200"
                  placeholder="Note (optional)"
                  value={en.note}
                  onChange={(e) => change(idx, "note", e.target.value)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="text-yellow-700 hover:text-yellow-800 font-semibold transition-all duration-150"
          >
            + Add Row
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/incomes")}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold hover:scale-105 transition-transform duration-200 shadow-md"
          >
            {incomeId ? "Update Day" : "Save Income"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
