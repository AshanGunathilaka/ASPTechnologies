import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import {
  fetchRepairById,
  createRepair,
  updateRepair,
  getNextJobSheetNumber,
} from "../../../api/repair";
import { fetchShops } from "../../../api/shops";
import { fetchItems } from "../../../api/items";

// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;

export default function RepairForm() {
  const { repairId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [itemNames, setItemNames] = useState([]); // suggestions from Items API
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    shop: "",
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

  const loadData = useCallback(async () => {
    try {
      const shopsRes = await fetchShops(token);
      setShops(shopsRes.data);

      // load item names to use as phone model suggestions (similar to Invoice form)
      try {
        const res = await fetchItems(token);
        const names = (res.data || []).map((it) => it.name).filter(Boolean);
        setItemNames(Array.from(new Set(names)));
      } catch {
        // ignore item load errors silently
      }

      const toDateInput = (d) => {
        if (!d) return "";
        try {
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return "";
          // HTML date input expects YYYY-MM-DD
          return dt.toISOString().slice(0, 10);
        } catch {
          return "";
        }
      };

      if (repairId) {
        const repairRes = await fetchRepairById(token, repairId);
        const repairData = repairRes.data;

        // ✅ Ensure the shop is stored as an ID, not an object
        setFormData((prev) => ({
          ...prev,
          ...repairData,
          shop: repairData.shop?._id || "",
          warrantyCard: repairData.warrantyCard || false,
          warrantyDate: toDateInput(repairData.warrantyDate),
        }));
      } else {
        // new record: prefill shop if single and prefill next job sheet number
        const updates = {};
        if (shopsRes.data.length === 1) updates.shop = shopsRes.data[0]._id;
        try {
          const next = await getNextJobSheetNumber(token);
          updates.jobSheetNumber = next.data.next || "";
        } catch {
          // ignore preview error
        }
        setFormData((prev) => ({ ...prev, ...updates }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    }
  }, [repairId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.shop) newErrors.shop = "Shop is required";
    if (!formData.jobSheetNumber?.trim())
      newErrors.jobSheetNumber = "Job sheet number is required";
    if (!formData.phoneModel?.trim())
      newErrors.phoneModel = "Phone model is required";
    if (!formData.customerName?.trim())
      newErrors.customerName = "Customer name is required";
    if (!formData.customerNumber?.trim())
      newErrors.customerNumber = "Customer number is required";
    else if (!/^\+?\d{7,15}$/.test(formData.customerNumber.trim()))
      newErrors.customerNumber = "Enter a valid phone number";
    if (formData.imei?.trim()) {
      const imei = formData.imei.trim();
      if (!/^\d+$/.test(imei)) newErrors.imei = "IMEI must be a number";
    }
    if (formData.warrantyCard && !formData.warrantyDate)
      newErrors.warrantyDate = "Warranty date is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      if (repairId) {
        await updateRepair(token, repairId, formData);
        toast.success("Repair updated successfully!");
      } else {
        await createRepair(token, formData);
        toast.success("Repair created successfully!");
      }
      navigate("/admin/repairs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save repair");
    }
  };

  const handleCheckboxChange = (e, parent = null) => {
    const { name, checked } = e.target;
    if (parent) {
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [name]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
  };

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
                {repairId ? "Edit Repair" : "Add Repair"}
              </h1>
              <p className="text-gray-500 text-sm">
                Create and update repair jobs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/repairs")}
            className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow"
          >
            ✖ Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200"
        >
          {/* Shop selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Shop
            </label>
            <select
              required
              value={formData.shop}
              onChange={(e) =>
                setFormData({ ...formData, shop: e.target.value })
              }
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            >
              <option value="">Select shop</option>
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Job Sheet #
              </label>
              <input
                type="text"
                required
                value={formData.jobSheetNumber}
                onChange={(e) =>
                  setFormData({ ...formData, jobSheetNumber: e.target.value })
                }
                readOnly={!repairId}
                className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Phone Model
              </label>
              <input
                type="text"
                required
                value={formData.phoneModel}
                onChange={(e) =>
                  setFormData({ ...formData, phoneModel: e.target.value })
                }
                list="repair-phone-model-list"
                placeholder="Start typing to search items..."
                className={`w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 ${
                  errors.phoneModel ? "border-red-500 ring-2 ring-red-200" : ""
                }`}
              />
              <datalist id="repair-phone-model-list">
                {itemNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {errors.phoneModel && (
                <p className="text-sm text-red-600 mt-1">{errors.phoneModel}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                IMEI
              </label>
              <input
                type="text"
                value={formData.imei}
                onChange={(e) =>
                  setFormData({ ...formData, imei: e.target.value })
                }
                className={`w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 ${
                  errors.imei ? "border-red-500 ring-2 ring-red-200" : ""
                }`}
              />
              {errors.imei && (
                <p className="text-sm text-red-600 mt-1">{errors.imei}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className={`w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 ${
                  errors.customerName
                    ? "border-red-500 ring-2 ring-red-200"
                    : ""
                }`}
              />
              {errors.customerName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Customer Number
              </label>
              <input
                type="text"
                required
                value={formData.customerNumber}
                onChange={(e) =>
                  setFormData({ ...formData, customerNumber: e.target.value })
                }
                className={`w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 ${
                  errors.customerNumber
                    ? "border-red-500 ring-2 ring-red-200"
                    : ""
                }`}
              />
              {errors.customerNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.customerNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Reported Faulty
              </label>
              <input
                type="text"
                value={formData.reportedFaulty}
                onChange={(e) =>
                  setFormData({ ...formData, reportedFaulty: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Warranty Card
              </label>
              <input
                type="checkbox"
                name="warrantyCard"
                checked={formData.warrantyCard}
                onChange={handleCheckboxChange}
                className="ml-2"
              />
            </div>
            {formData.warrantyCard && (
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Warranty Date
                </label>
                <input
                  type="date"
                  value={formData.warrantyDate}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyDate: e.target.value })
                  }
                  className={`w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 ${
                    errors.warrantyDate
                      ? "border-red-500 ring-2 ring-red-200"
                      : ""
                  }`}
                />
                {errors.warrantyDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.warrantyDate}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              >
                <option value="Received">Received</option>
                <option value="Sent">Sent</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Received Items */}
          <div className="mt-4">
            <h2 className="font-semibold mb-2 text-gray-800">Received Items</h2>
            {Object.keys(formData.receivedItems).map((item) => (
              <label key={item} className="inline-flex items-center mr-4 mb-2">
                <input
                  type="checkbox"
                  name={item}
                  checked={formData.receivedItems[item]}
                  onChange={(e) => handleCheckboxChange(e, "receivedItems")}
                  className="mr-2 accent-amber-500"
                />
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </label>
            ))}
          </div>

          {/* Damage Details */}
          <div className="mt-4">
            <h2 className="font-semibold mb-2 text-gray-800">Damage Details</h2>
            {Object.keys(formData.damageDetails).map((item) => (
              <label key={item} className="inline-flex items-center mr-4 mb-2">
                <input
                  type="checkbox"
                  name={item}
                  checked={formData.damageDetails[item]}
                  onChange={(e) => handleCheckboxChange(e, "damageDetails")}
                  className="mr-2 accent-amber-500"
                />
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </label>
            ))}
          </div>

          {/* Additional Note */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700">
              Additional Note
            </label>
            <textarea
              value={formData.additionalNote}
              onChange={(e) =>
                setFormData({ ...formData, additionalNote: e.target.value })
              }
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
            />
          </div>

          <button
            type="submit"
            className="relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500 shadow"
          >
            {repairId ? "Update Repair" : "Add Repair"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
