import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import { getItem } from "../../../api/item";

const __MOTION_REF__ = motion;

const badgeClass = (status) =>
  status === "available"
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

// (no date fields in current design)

export default function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getItem(token, itemId);
      setItem(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load item");
    } finally {
      setLoading(false);
    }
  }, [token, itemId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="p-6">
        <Toaster position="top-right" />
        Loading item details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6">
        <Toaster position="top-right" />
        <p className="text-red-600">Item not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
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
                Item Details
              </h1>
              <p className="text-gray-500 text-sm">
                Full information for this item
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/items`)}
              className="px-4 py-2 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="relative w-full max-w-[1280px] mx-auto aspect-square rounded-xl border overflow-hidden bg-gray-100">
                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/1280x1280?text=No+Image"
                  }
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  width="1280"
                  height="1280"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-xs">Name</span>
                <div className="text-xl font-semibold">{item.name}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Category</span>
                <div className="mt-0.5 text-sm font-medium text-gray-800">
                  {{
                    mobile: "Mobile",
                    smartphone: "Smart Phone",
                    accessories: "Accessories",
                    display: "Display",
                  }[item.category] || "Mobile"}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Status</span>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs border ${badgeClass(
                      item.status
                    )}`}
                  >
                    {item.status === "available" ? "Available" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Description</span>
                <div className="p-3 rounded-lg border bg-gray-50 min-h-[44px] text-gray-700 whitespace-pre-line">
                  {item.description || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
