import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addExpenseEntry,
  getExpenseDay,
  updateExpenseDay,
} from "../../../api/expenses";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

export default function ExpensesForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { expenseId } = useParams();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [noteDay, setNoteDay] = useState("");
  const [entries, setEntries] = useState([
    { purpose: "", outTo: "", category: "", amount: "", note: "" },
  ]);

  const loadExisting = useCallback(async () => {
    if (!expenseId) return;
    try {
      const res = await getExpenseDay(token, expenseId);
      const d = res.data;
      setDate(new Date(d.date).toISOString().slice(0, 10));
      setNoteDay(d.noteDay || "");
      setEntries(
        (d.entries || []).map((e) => ({
          purpose: e.purpose || "",
          outTo: e.outTo || "",
          category: e.category || "",
          amount: e.amount ?? "",
          note: e.note || "",
        }))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load expense day");
    }
  }, [expenseId, token]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const change = (idx, field, value) =>
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );

  const addRow = () =>
    setEntries((prev) => [
      ...prev,
      { purpose: "", outTo: "", category: "", amount: "", note: "" },
    ]);

  const removeRow = (idx) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (expenseId) {
        const payload = {
          date,
          noteDay,
          entries: entries.map((e) => ({
            purpose: e.purpose,
            outTo: e.outTo,
            category: e.category,
            amount: Number(e.amount || 0),
            note: e.note,
          })),
        };
        await updateExpenseDay(token, expenseId, payload);
        toast.success("Expense day updated");
      } else {
        for (const ent of entries) {
          if (!ent.purpose || ent.amount === "") continue;
          await addExpenseEntry(token, {
            date,
            purpose: ent.purpose,
            outTo: ent.outTo,
            category: ent.category,
            amount: Number(ent.amount || 0),
            note: ent.note,
            noteDay,
          });
        }
        toast.success("Expense(s) saved");
      }
      navigate("/admin/expenses");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save expenses");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />

      {/* Header */}
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
              {expenseId ? "Edit Expenses (Day)" : "Add Expenses"}
            </h1>
            <p className="text-gray-500 text-sm">
              Fill the expenses for the day
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/expenses"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {expenseId && (
            <Link
              to={`/admin/expenses/${expenseId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-6 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-yellow-300"
      >
        {/* Date & Note */}
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

        {/* Entries */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 font-semibold text-sm text-gray-700 border-b border-yellow-200 pb-2">
            <div className="col-span-4">Purpose</div>
            <div className="col-span-2">Out To</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2 text-right">Amount (LKR)</div>
            <div className="col-span-2">Note</div>
          </div>

          {entries.map((en, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center bg-yellow-50/40 p-2 rounded-xl hover:shadow-md transition-all duration-200"
            >
              <input
                className="col-span-4 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg transition-all duration-200"
                placeholder="Purpose"
                value={en.purpose}
                onChange={(e) => change(idx, "purpose", e.target.value)}
                required
              />
              <input
                className="col-span-2 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg transition-all duration-200"
                placeholder="Out To"
                value={en.outTo}
                onChange={(e) => change(idx, "outTo", e.target.value)}
              />
              <input
                className="col-span-2 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg transition-all duration-200"
                placeholder="Category"
                value={en.category}
                onChange={(e) => change(idx, "category", e.target.value)}
              />
              <input
                type="number"
                className="col-span-2 border border-yellow-200 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 p-2 rounded-lg text-right transition-all duration-200"
                placeholder="0.00"
                value={en.amount}
                onChange={(e) => change(idx, "amount", e.target.value)}
                min="0"
                step="0.01"
                required
              />
              <div className="col-span-2 flex gap-2">
                <input
                  className="w-full border border-yellow-300 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 p-2 rounded-lg outline-none"
                  placeholder="Note"
                  value={en.note}
                  onChange={(e) => change(idx, "note", e.target.value)}
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

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/expenses")}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold hover:scale-105 transition-transform duration-200 shadow-md"
          >
            {expenseId ? "Update Day" : "Save Expenses"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
