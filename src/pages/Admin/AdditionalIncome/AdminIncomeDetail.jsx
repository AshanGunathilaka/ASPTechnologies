import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getIncomeDay,
  deleteIncomeDay,
  deleteIncomeEntry,
} from "../../../api/incomes";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminIncomeDetail() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { incomeId } = useParams();

  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await getIncomeDay(token, incomeId);
        setDay(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, incomeId]);

  const onDeleteDay = async () => {
    const result = await Swal.fire({
      title: "Delete this income day?",
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
      await deleteIncomeDay(token, incomeId);
      toast.success("Income day deleted");
      navigate("/admin/incomes");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const onDeleteEntry = async (entryId) => {
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
      await deleteIncomeEntry(token, incomeId, entryId);
      toast.success("Entry removed");
      // reload
      const res = await getIncomeDay(token, incomeId);
      setDay(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const label = (t) => <span className="text-gray-500 text-sm">{t}</span>;
  const fmt = (n) => new Intl.NumberFormat().format(Number(n || 0));
  const totals = (d) => {
    const totalRevenue = (d.entries || []).reduce(
      (s, e) => s + Number(e.sellPrice || 0) * Number(e.quantity || 0),
      0
    );
    const totalCost = (d.entries || []).reduce(
      (s, e) => s + Number(e.buyPrice || 0) * Number(e.quantity || 0),
      0
    );
    const totalProfit = (d.entries || []).reduce(
      (s, e) =>
        s +
        Number(
          e.profit ??
            (Number(e.sellPrice || 0) - Number(e.buyPrice || 0)) *
              Number(e.quantity || 0)
        ),
      0
    );
    return { totalRevenue, totalCost, totalProfit };
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
              Income Day Details
            </h1>
            <p className="text-gray-500 text-sm">Review entries and totals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/incomes"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {day && (
            <Link
              to={`/admin/incomes/edit/${day._id}`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Edit
            </Link>
          )}
          <button
            onClick={onDeleteDay}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-5">
        {loading && <div className="text-gray-500">Loading...</div>}
        {!loading && !day && <div className="text-gray-500">Not found</div>}
        {day && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              {label("Date")}
              <div className="text-lg font-semibold">
                {new Date(day.date).toLocaleDateString()}
              </div>
            </div>
            <div>
              {label("Note")}
              <div>{day.noteDay || "-"}</div>
            </div>
            <div>
              {label("Revenue")}
              <div className="font-medium">
                {fmt(totals(day).totalRevenue)} LKR
              </div>
            </div>
            <div>
              {label("Cost")}
              <div className="font-medium">
                {fmt(totals(day).totalCost)} LKR
              </div>
            </div>
            <div>
              {label("Profit")}
              <div className="font-semibold text-emerald-700">
                {fmt(totals(day).totalProfit)} LKR
              </div>
            </div>

            <div className="sm:col-span-2">
              {label("Entries")}
              <div className="mt-2 border rounded-lg divide-y bg-white/60">
                {(day.entries || []).length === 0 && (
                  <div className="text-gray-500 text-sm p-3">No entries</div>
                )}
                {(day.entries || []).map((e) => (
                  <div
                    key={e._id}
                    className="flex justify-between items-center p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-gray-500">
                        Qty: {fmt(e.quantity)} | Buy: {fmt(e.buyPrice)} LKR |
                        Sell: {fmt(e.sellPrice)} LKR | Profit:{" "}
                        {fmt(
                          e.profit ??
                            (Number(e.sellPrice || 0) -
                              Number(e.buyPrice || 0)) *
                              Number(e.quantity || 0)
                        )}{" "}
                        LKR
                      </div>
                      {(e.customer || e.category || e.note) && (
                        <div className="text-gray-500">
                          {e.customer || "-"} • {e.category || "-"} •{" "}
                          {e.note || "-"}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteEntry(e._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {label("Created")}
              <div>{new Date(day.createdAt).toLocaleString()}</div>
            </div>
            <div>
              {label("Updated")}
              <div>{new Date(day.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
