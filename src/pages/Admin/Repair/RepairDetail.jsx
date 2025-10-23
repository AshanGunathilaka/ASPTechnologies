import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import { fetchRepairById } from "../../../api/repair";

// Keep ESLint happy for motion usage in JSX-only files
const __MOTION_REF__ = motion;

const formatDate = (d) => {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString();
  } catch {
    return "-";
  }
};

export default function RepairDetail() {
  const { repairId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchRepairById(token, repairId);
      setRepair(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load repair");
    } finally {
      setLoading(false);
    }
  }, [token, repairId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="p-6">
        <Toaster position="top-right" />
        Loading repair details...
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="p-6">
        <Toaster position="top-right" />
        <p className="text-red-600">Repair not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  const receivedItems = repair.receivedItems || {};
  const damageDetails = repair.damageDetails || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md"
            >
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
                  d="M4 7h16M4 12h16M7 21l3-3m0 0l3 3m-3-3V3"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Repair Details
              </h1>
              <p className="text-gray-500 text-sm">
                Full information for this job
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/repairs/edit/${repair._id}`)}
              className="px-4 py-2 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-6">
          {/* Key facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-xs">Job Sheet #</span>
              <div className="text-lg font-semibold">
                {repair.jobSheetNumber || "-"}
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Status</span>
              <div>
                <span
                  className={
                    "px-2 py-0.5 rounded-full text-xs border " +
                    (repair.status === "Completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : repair.status === "Delivered"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : repair.status === "Sent"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200")
                  }
                >
                  {repair.status}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Shop</span>
              <div className="text-lg">{repair.shop?.name || "-"}</div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Phone Model</span>
              <div className="text-lg">{repair.phoneModel || "-"}</div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Customer</span>
              <div className="text-lg">{repair.customerName || "-"}</div>
              <div className="text-gray-600">
                {repair.customerNumber || "-"}
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">IMEI</span>
              <div className="text-lg">{repair.imei || "-"}</div>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Reported Fault
              </h3>
              <div className="p-3 rounded-lg border bg-gray-50 min-h-[44px] text-gray-700">
                {repair.reportedFaulty || "-"}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Additional Note
              </h3>
              <div className="p-3 rounded-lg border bg-gray-50 min-h-[44px] text-gray-700">
                {repair.additionalNote || "-"}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Received Items
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(receivedItems).filter((k) => receivedItems[k])
                  .length === 0 && <span className="text-gray-600">None</span>}
                {Object.entries(receivedItems).map(([k, v]) =>
                  v ? (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200"
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Damage Details
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(damageDetails).filter((k) => damageDetails[k])
                  .length === 0 && <span className="text-gray-600">None</span>}
                {Object.entries(damageDetails).map(([k, v]) =>
                  v ? (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs border border-rose-200"
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Warranty</h3>
              <div className="p-3 rounded-lg border bg-gray-50 text-gray-700">
                <div>
                  <span className="text-gray-500 text-sm mr-1">Card:</span>
                  {repair.warrantyCard ? "Yes" : "No"}
                </div>
                {repair.warrantyCard && (
                  <div>
                    <span className="text-gray-500 text-sm mr-1">Date:</span>
                    {formatDate(repair.warrantyDate)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Timestamps</h3>
              <div className="p-3 rounded-lg border bg-gray-50 text-gray-700">
                <div>
                  <span className="text-gray-500 text-sm mr-1">Created:</span>
                  {formatDate(repair.createdAt)}
                </div>
                <div>
                  <span className="text-gray-500 text-sm mr-1">Updated:</span>
                  {formatDate(repair.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
