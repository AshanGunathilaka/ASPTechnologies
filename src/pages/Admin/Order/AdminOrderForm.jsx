import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  adminCreateOrder,
  adminGetOrder,
  adminUpdateOrder,
} from "../../../api/orders";
import { fetchShops } from "../../../api/shops";
import { fetchItems } from "../../../api/items";
import { fetchOffers } from "../../../api/offer";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function AdminOrderForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({
    shop: "",
    type: "item",
    item: "",
    offer: "",
    quantity: 1,
    note: "",
    price: undefined,
    status: "pending",
  });

  useEffect(() => {
    const load = async () => {
      const s = await fetchShops(token);
      setShops(Array.isArray(s.data) ? s.data : []);

      // Load all items and offers for selection
      try {
        const [itemsRes, offersRes] = await Promise.all([
          fetchItems(token, { limit: 1000 }),
          fetchOffers(token),
        ]);
        setItems(
          Array.isArray(itemsRes?.data)
            ? itemsRes.data
            : itemsRes?.data?.items || []
        );
        setOffers(
          Array.isArray(offersRes?.data)
            ? offersRes.data
            : offersRes?.data?.items || []
        );
      } catch {
        // Soft fail: keep arrays empty if fetching fails
        setItems([]);
        setOffers([]);
      }
      if (orderId) {
        const res = await adminGetOrder(token, orderId);
        const o = res.data;
        setForm({
          shop: o.shop?._id || o.shop,
          type: o.type,
          item: o.item?._id || o.item || "",
          offer: o.offer?._id || o.offer || "",
          quantity: o.quantity || 1,
          note: o.note || "",
          price: o.price,
          status: o.status,
          orderNumber: o.orderNumber,
        });
      }
    };
    if (token) load();
  }, [token, orderId]);

  const onTypeChange = (e) => {
    const t = e.target.value;
    setForm((prev) => ({ ...prev, type: t, item: "", offer: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      shop: form.shop,
      type: form.type,
      quantity: form.quantity,
      note: form.note,
      price: form.price,
      status: form.status,
    };
    if (form.type === "item") payload.item = form.item || undefined;
    if (form.type === "offer") payload.offer = form.offer || undefined;

    try {
      if (orderId) {
        await adminUpdateOrder(token, orderId, payload);
        toast.success("Order updated");
      } else {
        await adminCreateOrder(token, payload);
        toast.success("Order created");
      }
      navigate("/admin/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
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
              {orderId ? "Edit Order" : "New Order"}
            </h1>
            <p className="text-gray-500 text-sm">Fill in the details below</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {orderId && (
            <Link
              to={`/admin/orders/${orderId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200">
        {orderId && form?.orderNumber && (
          <div className="mb-4 text-sm text-gray-600">
            Order #: <span className="font-semibold">{form.orderNumber}</span>
          </div>
        )}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Shop</label>
            <select
              className="border rounded w-full p-2"
              value={form.shop}
              onChange={(e) => setForm({ ...form, shop: e.target.value })}
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
            <label className="block text-sm text-gray-600">Type</label>
            <select
              className="border rounded w-full p-2"
              value={form.type}
              onChange={onTypeChange}
            >
              <option value="item">Item</option>
              <option value="offer">Offer</option>
            </select>
          </div>
          {form.type === "item" ? (
            <div>
              <label className="block text-sm text-gray-600">Select Item</label>
              <select
                className="border rounded w-full p-2"
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                required
              >
                <option value="">Select an item</option>
                {items.map((it) => (
                  <option key={it._id} value={it._id}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-600">
                Select Offer
              </label>
              <select
                className="border rounded w-full p-2"
                value={form.offer}
                onChange={(e) => setForm({ ...form, offer: e.target.value })}
                required
              >
                <option value="">Select an offer</option>
                {offers.map((of) => (
                  <option key={of._id} value={of._id}>
                    {of.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Quantity</label>
              <input
                type="number"
                min={1}
                className="border rounded w-full p-2"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseInt(e.target.value || 1) })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">
                Price (optional)
              </label>
              <input
                type="number"
                className="border rounded w-full p-2"
                value={form.price ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Note</label>
            <textarea
              className="border rounded w-full p-2"
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Status</label>
            <select
              className="border rounded w-full p-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button className="px-6 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow">
              Save
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
