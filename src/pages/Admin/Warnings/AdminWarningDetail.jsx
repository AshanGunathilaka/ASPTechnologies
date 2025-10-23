import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { adminDeleteWarning, adminGetWarning } from "../../../api/warnings";
import { fetchBills } from "../../../api/shops";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminWarningDetail() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { warningId } = useParams();

  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shopBills, setShopBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await adminGetWarning(token, warningId);
        setWarning(res.data);
        // Load bills for the warning's shop to resolve bill details (number, totals)
        const shopId = res?.data?.shop?._id || res?.data?.shop;
        if (shopId) {
          setLoadingBills(true);
          try {
            const billsRes = await fetchBills(token, shopId);
            setShopBills(billsRes?.data || []);
          } finally {
            setLoadingBills(false);
          }
        } else {
          setShopBills([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, warningId]);

  const onDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this warning?",
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
      await adminDeleteWarning(token, warningId);
      toast.success("Warning deleted");
      navigate("/admin/warnings");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const label = (t) => <span className="text-gray-500 text-sm">{t}</span>;

  // Resolve warning.bills entries to full bill objects using shopBills when only IDs are present
  const resolvedBills = useMemo(() => {
    const wb = warning?.bills || [];
    if (!Array.isArray(wb)) return [];
    return wb
      .map((b) => {
        if (!b) return null;
        const id = typeof b === "string" ? b : b._id || b.id;
        if (!id) return b; // already an object with details
        const match = shopBills.find((x) => x._id === id);
        return match || (typeof b === "object" ? b : null);
      })
      .filter(Boolean);
  }, [warning?.bills, shopBills]);

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
              Warning Details
            </h1>
            <p className="text-gray-500 text-sm">
              Review the warning and related bills
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/warnings"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {warning && (
            <Link
              to={`/admin/warnings/${warning._id}`}
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
        {!loading && !warning && <div className="text-gray-500">Not found</div>}
        {warning && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              {label("Title")}
              <div className="text-xl font-semibold">{warning.title}</div>
            </div>
            <div>
              {label("Status")}
              <div className="capitalize inline-flex px-2 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                {warning.status}
              </div>
            </div>
            <div>
              {label("Shop")}
              <div>{warning.shop?.name || "-"}</div>
            </div>
            <div className="sm:col-span-2">
              {label("Message")}
              <div className="whitespace-pre-wrap text-gray-700">
                {warning.message || "-"}
              </div>
            </div>
            <div className="sm:col-span-2">
              {label("Bills")}
              <div className="mt-2 border rounded-lg divide-y bg-white/60">
                {loadingBills && (
                  <div className="text-gray-500 text-sm p-3">
                    Loading bills…
                  </div>
                )}
                {!loadingBills && resolvedBills.length === 0 && (
                  <div className="text-gray-500 text-sm p-3">
                    No bills available
                  </div>
                )}
                {!loadingBills &&
                  resolvedBills.map((b) => (
                    <div
                      key={b._id || b.number || Math.random()}
                      className="flex justify-between items-center p-3 text-sm"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          Bill Number: {b.number || b.billNumber || "-"}
                        </div>
                        <div className="text-gray-600">
                          Grand Total:{" "}
                          <span className="font-medium text-gray-900">
                            {b.grandTotal != null
                              ? `${new Intl.NumberFormat().format(
                                  b.grandTotal
                                )} LKR`
                              : b.total != null
                              ? `${new Intl.NumberFormat().format(b.total)} LKR`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              {label("Created")}
              <div>{new Date(warning.createdAt).toLocaleString()}</div>
            </div>
            <div>
              {label("Updated")}
              <div>{new Date(warning.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
