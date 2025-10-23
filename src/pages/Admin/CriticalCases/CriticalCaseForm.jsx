import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchCriticalCase,
  createCriticalCase,
  updateCriticalCase,
} from "../../../api/criticalCase";
import { fetchShops, fetchBills } from "../../../api/shops";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function CriticalCaseForm({ existingCase, onCancel, onSaved }) {
  const { caseId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [bills, setBills] = useState([]);
  const [formData, setFormData] = useState({
    shops: [],
    bills: [],
    description: "",
    severity: "Medium",
    remarks: "",
  });

  // Load all shops
  const loadShops = async () => {
    try {
      const res = await fetchShops(token);
      setShops(res.data || []);
    } catch (err) {
      console.error("Failed to load shops", err);
    }
  };

  // Load critical case if editing
  const loadCriticalCase = async () => {
    const id = caseId || existingCase?._id;
    if (!id) return;

    try {
      const res = await fetchCriticalCase(token, id);
      const data = res.data;

      setFormData({
        shops: data.shops.map((s) => s._id),
        bills: data.bills.map((b) => b._id),
        description: data.description,
        severity: data.severity,
        remarks: data.remarks || "",
      });

      // Load bills for first shop
      if (data.shops?.length) {
        const billsRes = await fetchBills(token, data.shops[0]._id);
        setBills(billsRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load critical case", err);
    }
  };

  useEffect(() => {
    loadShops();
    loadCriticalCase();
    // eslint-disable-next-line
  }, [caseId, existingCase?._id]);

  // Load bills when shop changes
  const handleShopChange = async (shopId) => {
    setFormData({ ...formData, shops: [shopId], bills: [] });
    try {
      const res = await fetchBills(token, shopId);
      setBills(res.data || []);
    } catch (err) {
      console.error("Failed to load bills", err);
    }
  };

  // Toggle selected bills
  const handleBillToggle = (billId) => {
    const selected = formData.bills.includes(billId)
      ? formData.bills.filter((id) => id !== billId)
      : [...formData.bills, billId];
    setFormData({ ...formData, bills: selected });
  };

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = caseId || existingCase?._id;
      if (id) {
        await updateCriticalCase(token, id, formData);
        toast.success("Critical case updated");
      } else {
        await createCriticalCase(token, formData);
        toast.success("Critical case created");
      }
      if (onSaved) onSaved();
      else navigate("/admin/criticalcases");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save critical case"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
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
              {caseId || existingCase?._id
                ? "Edit Critical Case"
                : "New Critical Case"}
            </h1>
            <p className="text-gray-500 text-sm">
              Fill the critical case details below
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onCancel ? onCancel() : navigate("/admin/criticalcases")
            }
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </button>
          {(caseId || existingCase?._id) && (
            <Link
              to={`/admin/criticalcases/${caseId || existingCase?._id}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200"
      >
        {/* Shop Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Shop</label>
          <select
            value={formData.shops[0] || ""}
            onChange={(e) => handleShopChange(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bills */}
        {bills.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Bills</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1 bg-white/60">
              {bills.map((bill) => (
                <label key={bill._id} className="block">
                  <input
                    type="checkbox"
                    value={bill._id}
                    checked={formData.bills.includes(bill._id)}
                    onChange={() => handleBillToggle(bill._id)}
                    className="mr-2"
                  />
                  Bill #{bill.number} -{" "}
                  {new Intl.NumberFormat().format(bill.grandTotal)} LKR
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
            rows="3"
            required
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <input
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
            placeholder="Optional notes..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={() =>
              onCancel ? onCancel() : navigate("/admin/criticalcases")
            }
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            {caseId || existingCase?._id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
