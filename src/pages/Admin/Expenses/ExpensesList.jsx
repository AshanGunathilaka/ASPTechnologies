import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchExpenseDays,
  deleteExpenseDay,
  deleteExpenseEntry,
} from "../../../api/expenses";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function ExpensesList() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchExpenseDays(token);
      setDays(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const dayTotal = (d) =>
    (d.entries || []).reduce((s, e) => s + Number(e.amount || 0), 0);

  const handleDeleteDay = async (id) => {
    const result = await Swal.fire({
      title: "Delete this expense day?",
      text: "This will remove the entire day's entries.",
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
      await deleteExpenseDay(token, id);
      toast.success("Expense day deleted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const handleDeleteEntry = async (id, entryId) => {
    const result = await Swal.fire({
      title: "Delete this entry?",
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
      await deleteExpenseEntry(token, id, entryId);
      toast.success("Entry removed");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
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
              Expenses
            </h1>
            <p className="text-gray-500 text-sm">Track expenses by day</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/expenses/new")}
            className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            + Add Expense
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200">
        {loading ? (
          <p>Loading...</p>
        ) : days.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          days.map((d) => (
            <div
              key={d._id}
              className="mb-6 border rounded-lg border-yellow-200"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-yellow-50 rounded-t-lg">
                <div>
                  <Link
                    to={`/admin/expenses/${d._id}/detail`}
                    className="font-semibold text-yellow-700 hover:underline"
                  >
                    {new Date(d.date).toLocaleDateString()}
                  </Link>
                  <div className="text-sm text-gray-600">{d.noteDay}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-end mt-4">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white font-extrabold text-lg shadow-md border border-yellow-300 tracking-wide">
                      Total: {new Intl.NumberFormat().format(dayTotal(d))} LKR
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/admin/expenses/${d._id}/detail`)}
                    className="px-3 py-1 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 text-xs shadow inline-flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                      <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                    </svg>
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/admin/expenses/edit/${d._id}`)}
                    className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs shadow inline-flex items-center gap-1 border border-gray-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M16.862 3.487a2.5 2.5 0 1 1 3.536 3.536l-11.07 11.07a4 4 0 0 1-1.592.966l-3.236.97a.75.75 0 0 1-.93-.93l.97-3.236a4 4 0 0 1 .966-1.592l11.07-11.07Z" />
                      <path d="M5.5 19h13a1.5 1.5 0 0 1 0 3h-13a1.5 1.5 0 0 1 0-3Z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDay(d._id)}
                    className="px-3 py-1 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs shadow inline-flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.917 21.75H8.083A2.25 2.25 0 0 1 5.84 19.673L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0A48.11 48.11 0 0 1 8.28 5.25m4.477 0c1.518 0 3.014.052 4.477.153M4.772 5.79L4.5 9m0 0h15m-15 0h15"
                      />
                    </svg>
                    Delete Day
                  </button>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-800">
                    <th className="text-left px-4 py-2">Purpose</th>
                    <th className="text-left px-4 py-2">Out To</th>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-right px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.entries || []).map((e) => (
                    <tr
                      key={e._id}
                      className="border-t border-yellow-100 hover:bg-yellow-50/50"
                    >
                      <td className="px-4 py-2">{e.purpose}</td>
                      <td className="px-4 py-2">{e.outTo}</td>
                      <td className="px-4 py-2">{e.category}</td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat().format(Number(e.amount || 0))}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeleteEntry(d._id, e._id)}
                          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
