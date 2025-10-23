import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { shopGetRepair } from "../../../api/shopRepairs";

export default function ShopRepairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useShopAuth();
  const token = auth?.token;
  const __MOTION_REF__ = motion;

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        const res = await shopGetRepair(token, id);
        setDoc(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load repair");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, id]);

  const yesNo = (v) => (v ? "Yes" : "No");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow text-sm"
          >
            Back
          </button>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
            Repair Detail
          </h1>
          <div className="w-[64px]" />
        </div>

        {loading ? (
          <div className="h-64 bg-yellow-100/60 rounded-2xl animate-pulse" />
        ) : !doc ? (
          <div className="text-center text-gray-500 bg-white/60 border border-yellow-200 rounded-2xl p-10">
            Not found
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">Job Sheet #</div>
                <div className="font-semibold text-yellow-800">
                  {doc.jobSheetNumber}
                </div>
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs border bg-gray-50 text-gray-700 border-gray-200 capitalize">
                    {doc.status}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">Phone Model</div>
                <div className="font-medium text-gray-800 break-words">
                  {doc.phoneModel}
                </div>
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">IMEI</div>
                <div className="font-medium text-gray-800 break-words">
                  {doc.imei}
                </div>
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">Customer Name</div>
                <div className="font-medium text-gray-800 break-words">
                  {doc.customerName}
                </div>
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">Customer Number</div>
                <div className="font-medium text-gray-800 break-words">
                  {doc.customerNumber}
                </div>
              </div>
              <div className="md:col-span-2 bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-gray-500">Reported Faulty</div>
                <div className="font-medium text-gray-800 break-words">
                  {doc.reportedFaulty}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="font-semibold text-gray-800 mb-2">Warranty</div>
                <div className="text-sm text-gray-700">
                  Card: {yesNo(doc.warrantyCard)}
                </div>
                {doc.warrantyCard && (
                  <div className="text-sm text-gray-700">
                    Date:{" "}
                    {doc.warrantyDate
                      ? new Date(doc.warrantyDate).toLocaleDateString()
                      : "-"}
                  </div>
                )}
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="font-semibold text-gray-800 mb-2">Created</div>
                <div className="text-sm text-gray-700">
                  {new Date(doc.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="font-semibold text-gray-800 mb-2">
                  Received Items
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Unit: {yesNo(doc?.receivedItems?.unit)}</li>
                  <li>
                    Battery Cover: {yesNo(doc?.receivedItems?.batteryCover)}
                  </li>
                  <li>Battery: {yesNo(doc?.receivedItems?.battery)}</li>
                  <li>Charger: {yesNo(doc?.receivedItems?.charger)}</li>
                </ul>
              </div>
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="font-semibold text-gray-800 mb-2">
                  Damage Details
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    Physical Damage: {yesNo(doc?.damageDetails?.physicalDamage)}
                  </li>
                  <li>
                    Liquid Damage: {yesNo(doc?.damageDetails?.liquidDamage)}
                  </li>
                  <li>LCD Broken: {yesNo(doc?.damageDetails?.lcdBroken)}</li>
                  <li>Drop Damage: {yesNo(doc?.damageDetails?.dropDamage)}</li>
                </ul>
              </div>
            </div>

            {doc.additionalNote && (
              <div className="bg-white/80 border border-yellow-200 rounded-2xl p-4">
                <div className="font-semibold text-gray-800 mb-1">
                  Additional Note
                </div>
                <div className="text-sm text-gray-700 break-words">
                  {doc.additionalNote}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
