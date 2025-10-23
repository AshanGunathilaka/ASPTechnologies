import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  shopCreateRepair,
  shopGetNextJobSheetNumber,
} from "../../../api/shopRepairs";
import { useShopAuth } from "../../../hooks/useShopAuth";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function ShopRepairForm() {
  const { auth } = useShopAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobSheetNumber: "",
    phoneModel: "",
    imei: "",
    reportedFaulty: "",
    warrantyCard: false,
    warrantyDate: "",
    receivedItems: {
      unit: false,
      batteryCover: false,
      battery: false,
      charger: false,
    },
    damageDetails: {
      physicalDamage: false,
      liquidDamage: false,
      lcdBroken: false,
      dropDamage: false,
    },
    customerName: "",
    customerNumber: "",
    status: "Received",
    additionalNote: "",
  });

  const [errors, setErrors] = useState({ customerNumber: "", imei: "" });

  useEffect(() => {
    const prefill = async () => {
      try {
        const res = await shopGetNextJobSheetNumber(token);
        setFormData((p) => ({ ...p, jobSheetNumber: res.data.next || "" }));
      } catch {
        // ignore
      }
    };
    if (token) prefill();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    const raw = String(formData.customerNumber || "");
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      setErrors((p) => ({
        ...p,
        customerNumber: "Enter a valid phone number (7-15 digits).",
      }));
      toast.error("Enter a valid customer number");
      return;
    }
    try {
      await shopCreateRepair(token, formData);
      toast.success("Warranty/Repair created");
      navigate("/shop/repairs");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create");
    }
  };

  // Tap-friendly checkbox chip
  const checkbox = (parent, name, labelText) => (
    <label
      className={`inline-flex items-center select-none px-3 py-2 rounded-xl border cursor-pointer transition mr-2 mb-2 text-sm ${
        formData[parent][name]
          ? "bg-yellow-50 border-yellow-300 text-yellow-800"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={formData[parent][name]}
        onChange={(e) =>
          setFormData({
            ...formData,
            [parent]: { ...formData[parent], [name]: e.target.checked },
          })
        }
      />
      <span
        className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
          formData[parent][name]
            ? "bg-yellow-500 border-yellow-500 text-white"
            : "border-gray-300 text-transparent"
        }`}
      >
        ✓
      </span>
      {labelText}
    </label>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl p-4 sm:p-6 shadow-md border border-yellow-200">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 w-full sm:w-auto rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow text-sm"
          >
            ← Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-800 text-center">
            Create Warranty
          </h1>
          <div className="hidden sm:block w-[64px]" />
        </div>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
        >
          <div>
            <label className="block text-sm text-gray-600">Job Sheet #</label>
            <input
              className="border border-yellow-200 rounded-xl w-full p-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
              value={formData.jobSheetNumber}
              onChange={(e) =>
                setFormData({ ...formData, jobSheetNumber: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Phone Model</label>
            <input
              className="border border-yellow-200 rounded-xl w-full p-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
              value={formData.phoneModel}
              onChange={(e) =>
                setFormData({ ...formData, phoneModel: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">IMEI</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]+"
              className={`border rounded-xl w-full p-2 focus:ring-2 focus:outline-none ${
                errors.imei
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-yellow-200 focus:ring-yellow-300"
              }`}
              value={formData.imei}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, imei: v });
                setErrors((p) => ({ ...p, imei: "" }));
              }}
              required
            />
            <div className="text-xs mt-1">
              {errors.imei ? (
                <span className="text-rose-600">{errors.imei}</span>
              ) : (
                <span className="text-gray-500">Digits only.</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Customer Name</label>
            <input
              className="border border-yellow-200 rounded-xl w-full p-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Customer Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{7,15}"
              className={`border rounded-xl w-full p-2 focus:ring-2 focus:outline-none ${
                errors.customerNumber
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-yellow-200 focus:ring-yellow-300"
              }`}
              value={formData.customerNumber}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, customerNumber: v });
                if (v.length === 0 || (v.length >= 7 && v.length <= 15)) {
                  setErrors((p) => ({ ...p, customerNumber: "" }));
                } else {
                  setErrors((p) => ({
                    ...p,
                    customerNumber: "Enter 7-15 digits.",
                  }));
                }
              }}
              required
            />
            <div className="mt-1 text-xs">
              {errors.customerNumber ? (
                <span className="text-rose-600">{errors.customerNumber}</span>
              ) : (
                <span className="text-gray-500">
                  Digits only, 7-15 characters.
                </span>
              )}
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm text-gray-600">
              Reported Faulty
            </label>
            <input
              className="border border-yellow-200 rounded-xl w-full p-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
              value={formData.reportedFaulty}
              onChange={(e) =>
                setFormData({ ...formData, reportedFaulty: e.target.value })
              }
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-wrap items-center gap-2">
            <label className="block text-sm text-gray-600">Warranty Card</label>
            <input
              type="checkbox"
              className="ml-2 h-5 w-5 text-yellow-600 focus:ring-yellow-400 rounded"
              checked={formData.warrantyCard}
              onChange={(e) =>
                setFormData({ ...formData, warrantyCard: e.target.checked })
              }
            />
          </div>

          {formData.warrantyCard && (
            <div>
              <label className="block text-sm text-gray-600">
                Warranty Date
              </label>
              <input
                type="date"
                className="border border-yellow-200 rounded-xl w-full p-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                value={formData.warrantyDate}
                onChange={(e) =>
                  setFormData({ ...formData, warrantyDate: e.target.value })
                }
              />
            </div>
          )}

          <div className="col-span-1 sm:col-span-2">
            <h3 className="font-medium mb-2">Received Items</h3>
            <div className="flex flex-wrap">
              {[
                checkbox("receivedItems", "unit", "Unit"),
                checkbox("receivedItems", "batteryCover", "Battery Cover"),
                checkbox("receivedItems", "battery", "Battery"),
                checkbox("receivedItems", "charger", "Charger"),
              ]}
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <h3 className="font-medium mb-2">Damage Details</h3>
            <div className="flex flex-wrap">
              {[
                checkbox("damageDetails", "physicalDamage", "Physical Damage"),
                checkbox("damageDetails", "liquidDamage", "Liquid Damage"),
                checkbox("damageDetails", "lcdBroken", "LCD Broken"),
                checkbox("damageDetails", "dropDamage", "Drop Damage"),
              ]}
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm text-gray-600">
              Additional Note
            </label>
            <textarea
              className="border border-yellow-200 rounded-xl w-full p-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none resize-y"
              rows={4}
              value={formData.additionalNote}
              onChange={(e) =>
                setFormData({ ...formData, additionalNote: e.target.value })
              }
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex justify-center sm:justify-end mt-4">
            <button className="bg-yellow-600 text-white px-6 py-2 rounded-xl shadow hover:bg-yellow-700 w-full sm:w-auto">
              Create
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
