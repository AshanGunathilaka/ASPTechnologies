import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchDailyStocks, deleteDailyStock } from "../../../api/dailyStock";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminDailyStockDetail() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { stockId } = useParams();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchDailyStocks(token);
        const found = (res.data || []).find((s) => s._id === stockId);
        setStock(found || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, stockId]);

  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this daily stock day?",
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
      await deleteDailyStock(token, stockId);
      toast.success("Daily stock deleted");
      navigate("/admin/dailystocks");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const label = (t) => <span className="text-gray-500 text-sm">{t}</span>;

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
              Daily Stock Details
            </h1>
            <p className="text-gray-500 text-sm">
              Review items and match status
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/dailystocks"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {stock && (
            <Link
              to={`/admin/dailystocks/edit/${stock._id}`}
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
        {!loading && !stock && <div className="text-gray-500">Not found</div>}
        {stock && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label("Date")}
                <div className="text-lg font-semibold">
                  {new Date(stock.date).toLocaleDateString()}
                </div>
              </div>
              <div>
                {label("Note")}
                <div>{stock.note || "-"}</div>
              </div>
            </div>

            <div>
              {label("Items")}
              <div className="mt-2 border rounded-lg overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-yellow-50 text-yellow-800">
                      <th className="text-left px-4 py-2">Item</th>
                      <th className="text-right px-4 py-2">Brought</th>
                      <th className="text-right px-4 py-2">Sold</th>
                      <th className="text-right px-4 py-2">
                        Expected Remaining
                      </th>
                      <th className="text-right px-4 py-2">Actual Remaining</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stock.items || []).map((it, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-yellow-100 hover:bg-yellow-50/40"
                      >
                        <td className="px-4 py-2">{it.productName}</td>
                        <td className="px-4 py-2 text-right">
                          {it.startingQty}
                        </td>
                        <td className="px-4 py-2 text-right">{it.soldQty}</td>
                        <td className="px-4 py-2 text-right">
                          {it.expectedRemainingQty}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {it.actualRemainingQty}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              it.matchStatus === "Matched"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {it.matchStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label("Created")}
                <div>{new Date(stock.createdAt).toLocaleString()}</div>
              </div>
              <div>
                {label("Updated")}
                <div>{new Date(stock.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
