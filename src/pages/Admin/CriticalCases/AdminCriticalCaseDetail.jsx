import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchCriticalCase,
  deleteCriticalCase,
} from "../../../api/criticalCase";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminCriticalCaseDetail() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchCriticalCase(token, caseId);
        setItem(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, caseId]);

  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this critical case?",
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
      await deleteCriticalCase(token, caseId);
      toast.success("Critical case deleted");
      navigate("/admin/criticalcases");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const label = (t) => <span className="text-gray-500 text-sm">{t}</span>;

  const severityBadge = (s) => {
    const m = String(s || "N/A").toLowerCase();
    const styles = {
      critical: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
      high: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
      medium: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
      low: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
      na: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
    };
    const t = styles[m] || styles.na;
    return (
      <span
        className="inline-flex px-2 py-1 rounded text-xs border capitalize"
        style={{ backgroundColor: t.bg, color: t.color, borderColor: t.border }}
      >
        {s || "N/A"}
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
              Critical Case Details
            </h1>
            <p className="text-gray-500 text-sm">Review the case information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/criticalcases"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {item && (
            <Link
              to={`/admin/criticalcases/${item._id}`}
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
        {!loading && !item && <div className="text-gray-500">Not found</div>}
        {item && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {label("Description")}
              <div className="text-xl font-semibold">{item.description}</div>
            </div>
            <div>
              {label("Severity")}
              <div>{severityBadge(item.severity)}</div>
            </div>
            <div>
              {label("Shops")}
              <div>
                {(item.shops || []).map((s) => s.name || s).join(", ") || "-"}
              </div>
            </div>
            <div className="sm:col-span-2">
              {label("Bills")}
              <div className="mt-2 border rounded-lg divide-y bg-white/60">
                {(item.bills || []).length === 0 && (
                  <div className="text-gray-500 text-sm p-3">No bills</div>
                )}
                {(item.bills || []).map((b) => (
                  <div
                    key={b._id || b}
                    className="flex justify-between items-center p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        Bill #{b.number || b.billNumber || "-"}
                      </div>
                      {(b.grandTotal != null || b.total != null) && (
                        <div className="text-gray-500">
                          {new Intl.NumberFormat().format(
                            b.grandTotal ?? b.total
                          )}{" "}
                          LKR
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {label("Created")}
              <div>{new Date(item.createdAt).toLocaleString()}</div>
            </div>
            <div>
              {label("Updated")}
              <div>{new Date(item.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
