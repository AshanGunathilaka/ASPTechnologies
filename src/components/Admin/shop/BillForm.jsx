import React, { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { fetchItems } from "../../../api/items";

export default function BillForm({
  initial = {},
  onSubmit,
  existingNumbers = [],
}) {
  const { auth } = useAuth();
  const token = auth?.token;
  const [form, setForm] = useState({
    number: initial.number || "",
    date: initial.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    items: initial.items || [{ description: "", quantity: 1, unitPrice: 0 }],
    discount: initial.discount || 0,
    notes: initial.notes || "",
    paymentType: initial.paymentType || "cash",
    creditOption: initial.creditOption || "cash",
    creditPeriodDays: initial.creditPeriodDays || 0,
  });

  const handleItemChange = (idx, key, value) => {
    const items = [...form.items];
    if (key === "unitPrice") {
      const clean = String(value).replace(/[^0-9.]/g, "");
      items[idx][key] = clean ? Number(clean) : 0;
    } else if (key === "quantity") {
      items[idx][key] = Number(value);
    } else {
      items[idx][key] = value;
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

  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const num = (form.number || "").trim();
    if (!num) {
      setErrors({ number: "Bill number is required" });
      return;
    }

    if (Array.isArray(existingNumbers)) {
      const normalized = existingNumbers.map((n) => String(n || "").trim());
      if (normalized.includes(num)) {
        setErrors({ number: "Bill number already exists" });
        return;
      }
    }

    setErrors({});
    onSubmit({ ...form, number: num });
  };

  const subTotal = form.items.reduce(
    (s, it) => s + (it.quantity * it.unitPrice || 0),
    0
  );
  const grandTotal = subTotal - Number(form.discount || 0);

  const [itemNames, setItemNames] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return;
        const res = await fetchItems(token);
        const names = (res.data || []).map((it) => it.name).filter(Boolean);
        setItemNames(Array.from(new Set(names)));
      } catch {
        // ignore
      }
    };
    load();
  }, [token]);

  return (
    <Motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-200"
    >
      {/* Bill Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Bill Number</label>
          <input
            placeholder="Bill Number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="p-3 border rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
            required
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

      {/* Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {form.items.map((item, idx) => (
            <Motion.div
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
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(idx, "description", e.target.value)
                  }
                  list="bill-item-list"
                  className="p-2 border rounded outline-none"
                />
                <datalist id="bill-item-list">
                  {itemNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1">Qty</label>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(idx, "quantity", e.target.value)
                  }
                  className="p-2 border rounded outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1">Unit Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Unit Price"
                  value={item.unitPrice}
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
                  readOnly
                  value={((item.quantity || 0) * (item.unitPrice || 0)).toFixed(
                    2
                  )}
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
            </Motion.div>
          ))}
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
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4 p-4 bg-yellow-50 rounded-xl shadow-inner border border-yellow-200 space-y-2"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <span>Sub total:</span>
          <span>{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1">Discount</label>
            <input
              type="number"
              value={form.discount}
              onChange={(e) =>
                setForm({ ...form, discount: Number(e.target.value) })
              }
              className="p-2 border rounded w-full sm:w-32 outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-amber-600 text-lg gap-2">
          <span>Grand total:</span>
          <span>{grandTotal.toFixed(2)}</span>
        </div>
      </Motion.div>

      {/* Payment Section */}
      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">Payment Type</label>
        <select
          value={form.paymentType}
          onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
          className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-amber-400 outline-none"
        >
          <option value="cash">Cash</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      {form.paymentType === "credit" && (
        <>
          <div className="mt-3">
            <label className="block text-sm font-semibold mb-1">
              Credit Option
            </label>
            <select
              value={form.creditOption}
              onChange={(e) =>
                setForm({ ...form, creditOption: e.target.value })
              }
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-semibold mb-1">
              Credit Period (days)
            </label>
            <input
              type="number"
              value={form.creditPeriodDays}
              onChange={(e) =>
                setForm({ ...form, creditPeriodDays: Number(e.target.value) })
              }
              className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
        </>
      )}

      <div className="mt-4 flex flex-col">
        <label className="text-sm font-semibold mb-1">Notes</label>
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-amber-400 outline-none"
        />
      </div>

      {/* Submit Button */}
      <Motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 4px 15px rgba(250, 204, 21, 0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="relative mt-4 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-60 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-[1.2s] rounded-xl"></span>
        <span className="relative z-10">💾 Save Bill</span>
      </Motion.button>
    </Motion.form>
  );
}
