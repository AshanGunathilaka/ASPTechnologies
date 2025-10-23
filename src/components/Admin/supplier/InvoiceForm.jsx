import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;
import { useAuth } from "../../../context/AuthContext";
import { fetchItems } from "../../../api/items";

export default function InvoiceForm({
  initial = {},
  existingInvoices = [],
  onSubmit,
}) {
  const { auth } = useAuth();
  const token = auth?.token;

  const [form, setForm] = useState({
    number: initial.number || "",
    date: initial.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    salesRep: initial.salesRep || "",
    creditDays:
      initial.creditDays === 0 || initial.creditDays
        ? String(initial.creditDays)
        : "",
    // keep discount as string to prevent input cursor issues while typing
    discount:
      initial.discount === 0 || initial.discount
        ? String(initial.discount)
        : "",
    items: initial.items || [{ description: "", quantity: 1, unitPrice: 0 }],
  });

  const [errors, setErrors] = useState({});
  const [itemNames, setItemNames] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        if (!token) return;
        const res = await fetchItems(token);
        const names = (res.data || []).map((it) => it.name).filter(Boolean);
        setItemNames(Array.from(new Set(names)));
      } catch {
        // ignore gracefully
      }
    };
    loadItems();
  }, [token]);

  const handleItemChange = (idx, k, v) => {
    const items = [...form.items];
    if (k === "quantity" || k === "unitPrice") {
      const cleanValue = v.replace(/[^0-9.]/g, "");
      items[idx][k] = cleanValue ? Number(cleanValue) : 0;
    } else {
      items[idx][k] = v;
    }
    setForm({ ...form, items });
  };

  const addItem = () =>
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, unitPrice: 0 }],
    });

  const removeItem = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Invoice number validation
    if (!form.number.trim()) {
      setErrors({ number: "Invoice number is required" });
      return;
    } else if (existingInvoices.includes(form.number.trim())) {
      setErrors({ number: "Invoice number already exists" });
      return;
    } else {
      setErrors({});
    }

    onSubmit(form);
  };

  const subtotal = form.items.reduce(
    (s, it) => s + (it.quantity * it.unitPrice || 0),
    0
  );
  const discountNum = parseFloat(form.discount);
  const grand = subtotal - (isNaN(discountNum) ? 0 : discountNum);

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-200"
    >
      {/* Invoice Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Invoice Number</label>
          <input
            placeholder="Invoice number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className={`p-3 border rounded-xl focus:ring-2 outline-none ${
              errors.number
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-amber-400"
            }`}
          />
          {errors.number && (
            <span className="text-red-500 text-xs mt-1">{errors.number}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-1">Sales Rep</label>
        <input
          placeholder="Sales rep"
          value={form.salesRep}
          onChange={(e) => setForm({ ...form, salesRep: e.target.value })}
          className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-amber-400 outline-none"
        />
      </div>

      {/* Credit Days */}
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-1">Credit Days</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="e.g. 30"
          value={form.creditDays}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
            setForm({ ...form, creditDays: digitsOnly });
          }}
          className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-amber-400 outline-none"
        />
      </div>

      {/* Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {form.items.map((it, idx) => {
            const amount = it.quantity * it.unitPrice;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                layout
                className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center bg-yellow-50 rounded-xl shadow-sm border border-yellow-200"
              >
                <div className="sm:col-span-2 flex flex-col">
                  <label className="text-xs font-semibold mb-1">
                    Description
                  </label>
                  <input
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) =>
                      handleItemChange(idx, "description", e.target.value)
                    }
                    list="invoice-item-list"
                    className="p-2 border rounded outline-none"
                  />
                  <datalist id="invoice-item-list">
                    {itemNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Qty</label>
                  <input
                    type="text"
                    value={it.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                    className="p-2 border rounded outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">
                    Unit Price
                  </label>
                  <input
                    type="text"
                    value={it.unitPrice}
                    onChange={(e) =>
                      handleItemChange(idx, "unitPrice", e.target.value)
                    }
                    className="p-2 border rounded outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Amount</label>
                  <input
                    type="text"
                    value={amount.toFixed(2)}
                    readOnly
                    className="p-2 border rounded bg-yellow-100 text-amber-700 font-semibold outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-500 text-sm mt-2 hover:underline sm:col-span-5"
                >
                  Remove Item
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-4 mb-4">
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 text-sm font-semibold text-blue-600 rounded-xl border border-blue-300 hover:bg-blue-50 transition-all"
        >
          + Add Item
        </button>
      </div>

      {/* Totals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4 p-4 bg-yellow-50 rounded-xl shadow-inner border border-yellow-200 space-y-2"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <span>Sub total:</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1">Discount</label>
            <input
              type="text"
              inputMode="decimal"
              value={form.discount}
              onChange={(e) => {
                // allow only digits and dot
                const v = e.target.value.replace(/[^0-9.]/g, "");
                // prevent multiple dots
                const cleaned = v.split(".").slice(0, 2).join(".");
                setForm({ ...form, discount: cleaned });
              }}
              className="p-2 border rounded w-full sm:w-32 outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-amber-600 text-lg gap-2">
          <span>Grand total:</span>
          <span>{grand.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 4px 15px rgba(250, 204, 21, 0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="relative mt-4 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-60 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-[1.2s] rounded-xl"></span>
        <span className="relative z-10">💾 Save Invoice</span>
      </motion.button>
    </motion.form>
  );
}
