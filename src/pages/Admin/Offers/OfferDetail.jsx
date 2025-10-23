import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchOffer } from "../../../api/offer";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const OfferDetail = () => {
  const __MOTION_REF__ = motion;
  const { auth } = useAuth();
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchOffer(auth.token, offerId);
        setOffer(data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load offer");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth?.token, offerId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-800">Offer details</h1>
          <div className="flex gap-2">
            <Link
              to={`/admin/offers/${offerId}`}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              Edit
            </Link>
            <Link
              to="/admin/offers"
              className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            >
              Back
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-yellow-100/60 rounded-2xl" />
            <div className="h-40 bg-yellow-100/60 rounded-2xl" />
          </div>
        ) : offer ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-yellow-800">
                  {offer.title}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    offer.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {offer.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {offer.startDate?.slice(0, 10)} → {offer.endDate?.slice(0, 10)}
              </div>
              {offer.description && (
                <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                  {offer.description}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <h3 className="font-semibold text-yellow-800 mb-2">Images</h3>
              {offer.images?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {offer.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`offer-${i}`}
                      className="h-32 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No images</div>
              )}
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <h3 className="font-semibold text-yellow-800 mb-2">Items</h3>
              {offer.items?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {offer.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 p-2 rounded-xl border border-yellow-100 bg-white/60"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.sku && (
                          <div className="text-xs text-gray-500 truncate">
                            {item.sku}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No items</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
            <div className="text-lg font-semibold mb-1">Offer not found</div>
            <div className="text-sm">It may have been removed.</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OfferDetail;
