import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  adminCreateWarning,
  adminGetWarning,
  adminUpdateWarning,
} from "../../../api/warnings";
import { fetchShops, fetchBills } from "../../../api/shops";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminWarningForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { warningId } = useParams();
  const [shops, setShops] = useState([]);
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [form, setForm] = useState({
    shop: "",
    bills: [],
    title: "Payment Warning",
    message: "Please settle pending bills.",
    status: "open",
  });

  useEffect(() => {
    const load = async () => {
      const s = await fetchShops(token);
      setShops(s.data);
      if (warningId) {
        const res = await adminGetWarning(token, warningId);
        const w = res.data;
        setForm({
          shop: w.shop?._id || w.shop,
          bills: (w.bills || []).map((b) => b._id || b),
          title: w.title,
          message: w.message || "",
          status: w.status,
        });
        // load bills for that shop
        await loadBills(token, w.shop?._id || w.shop);
      }
    };
    load();
  }, [token, warningId]);

  const loadBills = async (token, shopId) => {
    if (!shopId) {
      setBills([]);
      return;
    }
    setLoadingBills(true);
    try {
      const res = await fetchBills(token, shopId);
      setBills(res.data || []);
    } finally {
      setLoadingBills(false);
    }
  };

  const onShopChange = async (e) => {
    const shopId = e.target.value;
    setForm((prev) => ({ ...prev, shop: shopId, bills: [] }));
    await loadBills(token, shopId);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (warningId) {
        await adminUpdateWarning(token, warningId, form);
        toast.success("Warning updated");
      } else {
        await adminCreateWarning(token, form);
        toast.success("Warning created");
      }
      navigate("/admin/warnings");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const billOptions = useMemo(
    () =>
      bills.map((b) => ({
        id: b._id,
        label: `${b.number || ""}${
          b.grandTotal != null
            ? ` - ${new Intl.NumberFormat().format(b.grandTotal)}`
            : ""
        }`,
      })),
    [bills]
  );

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
              {warningId ? "Edit Warning" : "New Warning"}
            </h1>
            <p className="text-gray-500 text-sm">
              Fill the warning details below
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
          {warningId && (
            <Link
              to={`/admin/warnings/${warningId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>
      <form
        onSubmit={submit}
        className="max-w-2xl mx-auto space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200"
      >
        <div>
          <label className="block text-sm text-gray-600">Shop</label>
          <select
            className="border rounded w-full p-2"
            value={form.shop}
            onChange={onShopChange}
            required
          >
            <option value="">Select shop</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Bills</label>
          <div className="border rounded w-full p-2 max-h-48 overflow-auto bg-white/60">
            {loadingBills && (
              <div className="text-gray-500 text-sm">Loading bills…</div>
            )}
            {!loadingBills && billOptions.length === 0 && (
              <div className="text-gray-500 text-sm">No bills</div>
            )}
            {!loadingBills &&
              billOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={form.bills.includes(opt.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) => ({
                        ...prev,
                        bills: checked
                          ? [...prev.bills, opt.id]
                          : prev.bills.filter((id) => id !== opt.id),
                      }));
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Title</label>
          <input
            className="border rounded w-full p-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Message</label>
          <textarea
            className="border rounded w-full p-2"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Status</label>
          <select
            className="border rounded w-full p-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="open">Open</option>
            <option value="sent">Sent</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow">
            Save
          </button>
        </div>
      </form>
    </motion.div>
  );
}
