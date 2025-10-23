import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchOffers, deleteOffer } from "../../../api/offer";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const OffersPage = () => {
  const { auth } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await fetchOffers(auth.token);
      setOffers(data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const onDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete this offer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });
    if (!res.isConfirmed) return;
    try {
      await deleteOffer(auth.token, id);
      toast.success("Offer deleted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const statusBadge = (s) => (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        s === "active"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {s}
    </span>
  );

  // Reference constant for some eslint configs when using <motion.*>
  const __MOTION_REF__ = motion;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
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
                Offers
              </h1>
              <p className="text-gray-500 text-sm">Create and manage offers</p>
            </div>
          </div>
          <Link
            to="/admin/offers/new"
            className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            + New Offer
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-yellow-100/60" />
            ))}
          </div>
        ) : offers.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="rounded-2xl shadow-sm border border-yellow-200 bg-white/80 overflow-hidden flex flex-col"
              >
                {offer.images?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 p-2 bg-yellow-50/50 border-b border-yellow-100">
                    {offer.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`offer-img-${i}`}
                        className="h-24 w-full object-cover rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-24 bg-yellow-50 border-b border-yellow-100" />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-yellow-800 truncate">
                      {offer.title}
                    </h3>
                    {statusBadge(offer.status)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {offer.startDate?.slice(0, 10)} →{" "}
                    {offer.endDate?.slice(0, 10)}
                  </div>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {offer.description || ""}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {offer.items?.length || 0} items
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      to={`/admin/offers/${offer._id}/detail`}
                      className="px-3 py-1.5 rounded-xl bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50 shadow text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/offers/${offer._id}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(offer._id)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow text-sm ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
            <div className="text-lg font-semibold mb-1">No offers yet</div>
            <div className="text-sm">
              Create your first offer to get started.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OffersPage;
